/// <reference path="log.js" />
/// <reference path="indexedDB.js" />
/// <reference path="eventEmitter.js" />
/// <reference path="destiny2/apiClient.js" />

var firstLaunch = true;
var mainWindowId = null;
var overlayWindowId = null;

function openWindow(event, originEvent) {
  if (event) {
    log("WINDOW", "Got launch event: ", event);
  }

  if (
    event &&
    (event.origin == "overwolfstartlaunchevent" ||
      event.origin == "gamelaunchevent")
  ) {
    return;
  }

  if (event && event.origin == "urlscheme") {
    log("URL-LAUNCH", event);

    let urlSchemeStart = unescape(event.parameter);

    handleUrlLaunch(urlSchemeStart);
    return;
  }

  overwolf.windows.obtainDeclaredWindow("mainWindow", (result) => {
    if (!result.success) {
      return;
    }

    mainWindowId = result.window.id;
    overwolf.windows.restore(result.window.id);
    log("WINDOW", `Opening window. Reason: ${originEvent}`, event);
  });
}

var appUpdateCheck = null;

// function that handles the url-scheme event based on what comes directly after "d2overlay://"
async function handleUrlLaunch(urlSchemeStart) {
  if (urlSchemeStart.indexOf("d2overlay://") == 0) {
    let urlScheme = urlSchemeStart.substr(12);
    let urlSchemeParts = urlScheme.split("/");
    let urlSchemeType = urlSchemeParts[0];
    let urlSchemeId = urlSchemeParts[1];

    if (urlSchemeType == "authenticate") {
      if (urlSchemeId) {
        var queryParams = parseQueryString(urlSchemeId);

        let _state = queryParams.find((i) => i.key == "state");
        let _code = queryParams.find((i) => i.key == "code");

        if (_state && _code) {
          let res = destinyApiClient.getToken(_state.value, _code.value);
          if (res == null) {
            // Something is wrong, we got the wrong state from a request, so we are just ignoring it for now.
          } else {
            log("BUNGIEAUTH", "Successful");
            await destinyApiClient.checkManifestVersion();
            await destinyApiClient.getUserMemberships();
            await destinyApiClient.getTrackableData(true);
          }
        }
      }
    }
  }
}

function parseQueryString(queryString) {
  return queryString
    .replace("?", "")
    .split("&")
    .map((i) => [i.split("=", 1)[0], i.substr(i.indexOf("=") + 1)])
    .map((i) => {
      return { key: i[0], value: i[1] };
    });
}

function gameLaunched(game) {
  if (game && game.classId == 21812) {
    log("GAME:LAUNCH", game);
    eventEmitter.emit("game-launched", game);
  }
}

function gameInfoUpdated(game) {
  if (
    game &&
    game.gameInfo &&
    !game.gameInfo.isRunning &&
    game.runningChanged
  ) {
    log("GAME:UPDATE", game);
    eventEmitter.emit("game-exited", game);
  }
}

function exitApp(reason) {
  log("EXIT", reason);
  overwolf.windows.getCurrentWindow(function (window) {
    overwolf.windows.close(window.window.id, function () {});
  });
}

if (firstLaunch) {
  log(
    "INIT",
    "Initializing all event handlers and getting all the recently played games (to see if we missed anything)"
  );

  if (!window.eventEmitter) {
    window.eventEmitter = new EventEmitter();
  }

  log("INIT:LAUNCHREASON", location.search);

  let wasPreviouslyOpened = localStorage.getItem("mainWindow_opened");

  let locSearch = location.search;

  if (
    locSearch.indexOf("-from-desktop") > -1 ||
    locSearch.indexOf("source=commandline") > -1 ||
    locSearch.indexOf("source=dock") > -1 ||
    locSearch.indexOf("source=storeapi") > -1 ||
    locSearch.indexOf("source=odk") > -1 ||
    locSearch.indexOf("source=after-install") > -1 ||
    locSearch.indexOf("source=tray") > -1 ||
    (wasPreviouslyOpened != null && wasPreviouslyOpened == "true")
  ) {
    localStorage.removeItem("mainWindow_opened");
    openWindow(null, locSearch);
  } else if (locSearch.indexOf("source=gamelaunchevent") > -1) {
    log("GAME:LAUNCH", "Application was started by game");
    overwolf.games.getRunningGameInfo(function (data) {
      if (data) {
        gameLaunched(data);
      }
    });
  } else if (locSearch.indexOf("source=urlscheme")) {
    log("URL-LAUNCH", "Application was started by url", locSearch);
    let urlSchemeStart = unescape(locSearch.replace("?source=urlscheme&", ""));

    handleUrlLaunch(urlSchemeStart);
  }

  // Removes the source-value from location.search, so we don't trigger multiple times
  history.replaceState(
    {},
    window.title,
    location.href.replace(location.search, "")
  );

  firstLaunch = false;

  overwolf.extensions.onAppLaunchTriggered.removeListener(openWindow);
  overwolf.games.onGameLaunched.removeListener(gameLaunched);
  overwolf.games.onGameInfoUpdated.removeListener(gameInfoUpdated);

  overwolf.extensions.onAppLaunchTriggered.addListener(openWindow);
  overwolf.games.onGameLaunched.addListener(gameLaunched);
  overwolf.games.onGameInfoUpdated.addListener(gameInfoUpdated);

  window.eventEmitter.addEventListener("game-launched", function (gameInfo) {
    log("EVENT:GAME-LAUNCHED", gameInfo);

    openOverlay();
  });

  window.eventEmitter.addEventListener("overlay-opened", function () {
    setTimeout(async function () {
      await destinyApiClient.getTrackableData(true);
    }, 5000);
  });

  function openOverlay() {
    if (overlayWindowId == null) {
      overwolf.windows.obtainDeclaredWindow("overlayWindow", (result) => {
        if (!result.success) {
          return;
        }

        overlayWindowId = result.window.id;
        overwolf.windows.restore(overlayWindowId);
        overwolf.windows.changePosition(
          overlayWindowId,
          30,
          parseInt(window.screen.availHeight / 4 - 50),
          console.log
        );

        overwolf.windows.changeSize(
          {
            window_id: overlayWindowId,
            width: 250,
            height: parseInt(window.screen.availHeight * 0.75),
            auto_dpi_resize: false,
          },
          console.log
        );
      });
    }
  }

  window.eventEmitter.addEventListener("game-exited", function (gameInfo) {
    log("EVENT:GAME-EXITED", gameInfo);

    if (!mainWindowId) {
      window.eventEmitter.emit(
        "shutdown",
        "Main window not open or hidden, closing application"
      );
      return;
    }

    overwolf.windows.getWindowState(mainWindowId, function (state) {
      if (
        state.success &&
        (state.window_state_ex == "closed" || state.window_state_ex == "hidden")
      ) {
        window.eventEmitter.emit(
          "shutdown",
          "Main window not open or hidden, closing application"
        );
      }
    });
  });

  window.eventEmitter.addEventListener("download-update", function () {
    overwolf.extensions.updateExtension(handleUpdateMessages);
  });

  function handleUpdateMessages(updateExtensionResult) {
    if (updateExtensionResult.success) {
      // This is what happens when the update was successful
      checkExtensionUpdate();
    } else {
      // Oh no, we failed to update, lets check why

      overwolf.windows.getWindowState(mainWindowId, function (state) {
        if (
          state.success &&
          state.window_state_ex != "closed" &&
          state.window_state_ex != "hidden"
        ) {
          window.eventEmitter.emit("main-window-notification", {
            class: "error",
            message: updateExtensionResult.info,
          });
        }
      });
    }
  }

  window.eventEmitter.addEventListener("relaunch-check", function () {
    overwolf.windows.getWindowState(mainWindowId, function (state) {
      localStorage.setItem(
        "mainWindow_opened",
        state.success &&
          state.window_state_ex != "closed" &&
          state.window_state_ex != "hidden"
      );
      overwolf.extensions.relaunch();
    });
  });

  window.eventEmitter.addEventListener("update-available", function (version) {
    log("UPDATE-CHECK", "New version available of the app", version);
  });

  window.eventEmitter.addEventListener(
    "update-pending-restart",
    function (version) {
      log(
        "UPDATE-CHECK",
        "Waiting for user to restart app so we can apply the new version",
        version
      );
    }
  );

  window.eventEmitter.addEventListener("shutdown", function (reason) {
    log("EXIT", "Supposed to exit:", reason);
    exitApp(reason);
  });

  function checkExtensionUpdate() {
    overwolf.extensions.checkForExtensionUpdate((updateState) => {
      if (updateState.success) {
        switch (updateState.state) {
          case "UpdateAvailable": // An update to the app is available
            log(
              "UPDATE-CHECK",
              "New version available!",
              updateState.updateVersion
            );

            window.eventEmitter.emit(
              "update-available",
              updateState.updateVersion
            );
            break;
          case "PendingRestart": // We have updated the app in the background and now just wait until we can relaunch the app
            log(
              "UPDATE-CHECK",
              "Waiting for moment to restart app to get new update",
              updateState.updateVersion
            );

            window.eventEmitter.emit(
              "update-pending-restart",
              updateState.updateVersion
            );
            break;
          case "UpToDate": // Do nothing, the app is up to date
            break;
          default:
            // Never gonna go here, but for safekeeping
            log("UPDATE-CHECK", "Unknown state", updateState);
            break;
        }
      }
    });
  }

  overwolf.games.getRunningGameInfo(function (data) {
    if (data) {
      gameLaunched(data);
    }
  });

  setInterval(function () {
    checkExtensionUpdate();
  }, 3600000); // Once every hour

  log("INIT", "All eventhandlers have been set");

  if (!window.db) {
    log("DATABASE", "Initializing database");
    window.db = new Destiny2Database();
    db.initializeDatabase().then(() => {
      window.destinyApiClient = new DestinyApiClient();

      openOverlay();
    });
  }
}
