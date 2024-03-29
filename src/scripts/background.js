import { log } from "./log.js";
import { EventEmitter } from "./eventEmitter.js";
import { Destiny2Database } from "./indexedDB.js";
import { DestinyApiClient } from "./destiny2/apiClient.js";

var firstLaunch = true;
var mainWindowId = null;
var overlayWindowId = null;
var loadingWindowId = null;

var wasManuallyOpened = false;

const destiny2ClassId = 21812;

function openWindow(event, originEvent) {
  if (event) {
    log("WINDOW", "Got launch event: ", event);
  }

  if (event && (event.origin == "overwolfstartlaunchevent" || event.origin == "gamelaunchevent")) {
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

async function handleUrlLaunch(urlSchemeStart) {
  if (urlSchemeStart.indexOf("d2overlay://") == 0) {
    let urlScheme = urlSchemeStart.substr(12);
    let urlSchemeParts = urlScheme.split("/");
    let urlSchemeType = urlSchemeParts[0];
    let urlSchemeId = urlSchemeParts[1];

    if (urlSchemeType == "authenticate" && urlSchemeId) {
      var queryParams = parseQueryString(urlSchemeId);

      let _state = queryParams.find((i) => i.key == "state");
      let _code = queryParams.find((i) => i.key == "code");

      if (_state && _code) {
        let res = await destinyApiClient.getToken(_state.value, _code.value);
        if (res == null) {
          // Something is wrong, we got the wrong state from a request, so we are just ignoring it for now.
          eventEmitter.emit("auth-unsuccessful");
        } else {
          log("BUNGIEAUTH", "Successful");
          await destinyApiClient.checkManifestVersion();
          await destinyApiClient.getLinkedProfiles();
          await destinyApiClient.getTrackableData(true);

          eventEmitter.emit("auth-successful");
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
  if (game && game.classId == destiny2ClassId) {
    log("GAME:LAUNCH", game);
    eventEmitter.emit("game-launched", game);
  }
}

function gameInfoUpdated(game) {
  if (game && game.gameInfo && !game.gameInfo.isRunning && game.runningChanged) {
    log("GAME:UPDATE", game);
    eventEmitter.emit("game-exited", game);
  }
}

function openLoadingWindow() {
  overwolf.windows.obtainDeclaredWindow("loadingWindow", (result) => {
    if (!result.success) {
      return;
    }

    loadingWindowId = result.window.id;
    overwolf.windows.restore(result.window.id);
    log("WINDOW", `Opening window. Reason: Missing manifest data`);
  });
}

async function initializeDatabase() {
  log("DATABASE", "Initializing database");
  window.db = new Destiny2Database();
  await db.initializeDatabase();
  log("ApiClient-Plugin", "Initializing plugin");

  overwolf.extensions.current.getExtraObject("destiny2ApiClient", async (result) => {
    if (result.status == "success") {
      window.d2ApiClient = result.object;

      window.destinyApiClient = new DestinyApiClient(d2ApiClient);

      await destinyApiClient.checkManifestVersion();

      let missingDefinitions = await destinyApiClient.checkStoredDefinitions(false);

      let showLoadingWindow = true;

      if (missingDefinitions.length > 0) {
        log("DATABASE", "Missing definitions, downloading them", missingDefinitions);
        showLoadingWindow = true;
      }

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
        wasManuallyOpened = true;

        if (showLoadingWindow) {
          log("DATABASE", "Opening loading window");
          openLoadingWindow();
        }
      } else if (locSearch.indexOf("source=gamelaunchevent") > -1) {
        log("GAME:LAUNCH", "Application was started by game");
        if (showLoadingWindow) {
          log("DATABASE", "Opening loading window");
          openLoadingWindow();
        }
        overwolf.games.getRunningGameInfo(function (data) {
          if (data) {
            gameLaunched(data);
          }
        });
      } else if (locSearch.indexOf("source=urlscheme")) {
        log("URL-LAUNCH", "Application was started by url", locSearch);
        let urlSchemeStart = unescape(locSearch.replace("?source=urlscheme&", ""));

        if (showLoadingWindow) {
          log("DATABASE", "Opening loading window");
          openLoadingWindow();
        }

        handleUrlLaunch(urlSchemeStart);
      }

      // Removes the source-value from location.search, so we don't trigger multiple times
      history.replaceState({}, window.title, location.href.replace(location.search, ""));
      log("DATABASE", "Database initialized");

      log("INIT:LAUNCHREASON", location.search);

      firstLaunch = false;

      overwolf.extensions.onAppLaunchTriggered.removeListener(openWindow);
      overwolf.games.onGameLaunched.removeListener(gameLaunched);
      overwolf.games.onGameInfoUpdated.removeListener(gameInfoUpdated);

      overwolf.extensions.onAppLaunchTriggered.addListener(openWindow);
      overwolf.games.onGameLaunched.addListener(gameLaunched);
      overwolf.games.onGameInfoUpdated.addListener(gameInfoUpdated);

      overwolf.settings.hotkeys.onPressed.addListener((event) => {
        if (event && event.name) {
          switch (event.name) {
            case "toggle_Destiny2_Overlay":
              toggleOverlay();
              break;
          }
        }
      });

      window.eventEmitter.addEventListener("game-launched", function (gameInfo) {
        log("EVENT:GAME-LAUNCHED", gameInfo);

        openOverlay();
      });

      //window.eventEmitter.addEventListener("destiny-logout", function () {
      //  clearInterval(window.historyChecker);
      //});

      window.eventEmitter.addEventListener("overlay-opened", function () {
        setTimeout(async function () {
          await destinyApiClient.getTrackableData(true);
        }, 5000);
      });

      function closeLoadingWindow() {
        overwolf.windows.close(loadingWindowId, function () {});
      }

      function toggleOverlay() {
        if (overlayWindowId) {
          overwolf.windows.getWindowState(overlayWindowId, (result) => {
            switch (result.window_state_ex) {
              case "normal":
                overwolf.windows.hide(overlayWindowId, function () {});
                break;
              default:
                overwolf.windows.restore(overlayWindowId, function () {});
                break;
            }
          });
        } else {
          openOverlay();
        }
      }

      function openOverlay() {
        if (overlayWindowId == null) {
          overwolf.windows.obtainDeclaredWindow("overlayWindow", async (result) => {
            if (!result.success) {
              return;
            }

            let windowPosition = JSON.parse(await db.getItem(`${result.window.id}-position`)) || {
              left: parseInt(window.screen.availWidth - 250),
              top: parseInt(window.screen.availHeight / 4 - 50),
            };

            overlayWindowId = result.window.id;
            overwolf.windows.restore(overlayWindowId);
            overwolf.windows.changePosition(overlayWindowId, windowPosition.left, windowPosition.top, () => {});

            let overlayWidth = 250;

            if (window.screen.availWidth > 1950) {
              overlayWidth = 250;
            } else if (window.screen.availWidth > 1900) {
              overlayWidth = 200;
            } else if (window.screen.availWidth > 1800) {
              overlayWidth = 150;
            }

            overwolf.windows.changeSize(
              {
                window_id: overlayWindowId,
                width: overlayWidth,
                height: parseInt(window.screen.availHeight * 0.75),
                auto_dpi_resize: false,
              },
              () => {}
            );
          });
        }
      }

      window.eventEmitter.addEventListener("main-window-closed", function () {
        overwolf.games.getRunningGameInfo(function (data) {
          if (data == null || data.classId != destiny2ClassId) {
            exitApp("No game running, no need to run in the background");
          }
        });
      });

      window.eventEmitter.addEventListener("game-exited", function (gameInfo) {
        log("EVENT:GAME-EXITED", gameInfo);

        if (!mainWindowId) {
          window.eventEmitter.emit("shutdown", "Main window not open or hidden, closing application");
          return;
        }

        overwolf.windows.getWindowState(mainWindowId, function (state) {
          if (state.success && (state.window_state_ex == "closed" || state.window_state_ex == "hidden")) {
            window.eventEmitter.emit("shutdown", "Main window not open or hidden, closing application");
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
            if (state.success && state.window_state_ex != "closed" && state.window_state_ex != "hidden") {
              window.eventEmitter.emit("main-window-notification", {
                class: "error",
                title: "Error",
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
            state.success && state.window_state_ex != "closed" && state.window_state_ex != "hidden"
          );
          overwolf.extensions.relaunch();
        });
      });

      window.eventEmitter.addEventListener("update-available", function (version) {
        log("UPDATE-CHECK", "New version available of the app", version);
      });

      window.eventEmitter.addEventListener("update-pending-restart", function (version) {
        log("UPDATE-CHECK", "Waiting for user to restart app so we can apply the new version", version);
      });

      window.eventEmitter.addEventListener("shutdown", function (reason) {
        log("EXIT", "Supposed to exit:", reason);
        exitApp(reason);
      });

      window.eventEmitter.addEventListener("auth-successful", function () {
        overwolf.notifications.showToastNotification(
          {
            header: "Authentication Successful",
            texts: [
              "Bungie.net authentication succeeded",
              "The Goal tracker will now have access (read only) to your account.",
              "We use it to be able to pull information about milestones, records, challenges and so on!",
            ],
          },
          console.log
        );
      });

      window.eventEmitter.addEventListener("auth-unsuccessful", function () {
        overwolf.notifications.showToastNotification(
          {
            header: "Authentication Unsuccessful",
            texts: [
              "Bungie.net authentication didn't succeed",
              "The Goal tracker will not be able to read data from the API.",
              "We use it to be able to pull information about milestones, records, challenges and so on!",
            ],
          },
          console.log
        );
      });

      window.eventEmitter.addEventListener("destiny-data-loaded", async function () {
        if (await destinyApiClient.isAuthenticated()) {
          await destinyApiClient.checkManifestVersion();
          await destinyApiClient.getTrackableData(true);
        } else {
          window.eventEmitter.emit("destiny-not-authed");
        }
      });

      window.eventEmitter.addEventListener("manifests-loaded", async function () {
        closeLoadingWindow();

        if (!(await destinyApiClient.isAuthenticated()) || wasManuallyOpened) {
          localStorage.removeItem("mainWindow_opened");
          openWindow(null, null);
          //openOverlay();
        }
      });

      function checkExtensionUpdate() {
        overwolf.extensions.checkForExtensionUpdate((updateState) => {
          if (updateState.success) {
            switch (updateState.state) {
              case "UpdateAvailable": // An update to the app is available
                log("UPDATE-CHECK", "New version available!", updateState.updateVersion);

                window.eventEmitter.emit("update-available", updateState.updateVersion);
                break;
              case "PendingRestart": // We have updated the app in the background and now just wait until we can relaunch the app
                log("UPDATE-CHECK", "Waiting for moment to restart app to get new update", updateState.updateVersion);

                window.eventEmitter.emit("update-pending-restart", updateState.updateVersion);
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

      window.historyChecker = setInterval(async function () {
        if (destinyApiClient.profile) {
          let lastPlayed = await destinyApiClient.getLastPlayedCharacter();
          try {
            await destinyApiClient.loadCharacterHistory(
              lastPlayed.characterInfo.membershipId,
              lastPlayed.characterInfo.characterId
            );
          } catch (e) {}
        }
      }, 300 * 1000);

      setInterval(function () {
        checkExtensionUpdate();
      }, 3600000); // Once every hour

      log("INIT", "All eventhandlers have been set");
    }
  });
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

  if (!window.db) {
    initializeDatabase();
  }
}
