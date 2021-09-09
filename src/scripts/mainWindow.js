/// <reference path="eventEmitter.js" />
/// <reference path="date.js" />
/// <reference path="log.js" />
/// <reference path="utils.js" />
/// <reference path="destiny2/apiClient.js" />
/// <reference path="../../resources/scripts/bootstrap.min.js" />

const backgroundWindow = overwolf.windows.getMainWindow();

/** @type EventEmitter */
const eventEmitter = backgroundWindow.eventEmitter;

const db = backgroundWindow.db;

var overwolfAdvertiseObject = null;
var overwolfAdvertiseInitialized = false;

const destinyApiClient = backgroundWindow.destinyApiClient;

eventEmitter.addEventListener("game-launched", function (game) {});

var windowReload = null;

eventEmitter.addEventListener("refresh-window", function (window) {
  if (window == "mainWindow") {
    if (windowReload != null) {
      clearTimeout(windowReload);
    }
    windowReload = setTimeout(function () {
      windowReload = null;
    }, 100);
  }
});

function setLastPlayedCharacter(lastPlayed) {
  let lastPlayedClass = document.querySelector("#lastPlayedClass");
  let lastPlayedTotalTime = document.querySelector("#lastPlayedTotalTime");

  lastPlayedClass.innerText = `${lastPlayed.genderName} ${lastPlayed.raceName} ${lastPlayed.className}`;
  lastPlayedTotalTime.innerText = `Played ${formatTimespan(
    new Date(),
    new Date(Date.now() + lastPlayed.minutesPlayedTotal * 60 * 1000)
  )}`;
}

eventEmitter.addEventListener("destiny-data-loaded", async function () {
  await destinyApiClient.getNamedDataObject(true);
});

eventEmitter.addEventListener("destiny-not-authed", function () {
  document.querySelector("#authenticateWithBungie").style.display = "";
  document.querySelector("#logoutFromBungie").style.display = "none";
});

eventEmitter.addEventListener(
  "destiny2-api-update",
  function (namedDataObject) {
    let lastPlayedCharacter = namedDataObject.characterInfo;

    setLastPlayedCharacter(lastPlayedCharacter);
  }
);

eventEmitter.addEventListener("game-exited", function () {});

function onOwAdReady() {
  if (typeof OwAd === "undefined") {
    document.getElementById("adContainer").style.display = "none";
    return;
  }

  overwolfAdvertiseObject = new OwAd(document.getElementById("ow_ad"));
  overwolfAdvertiseObject.addEventListener("ow_internal_rendered", () => {
    overwolfAdvertiseInitialized = true;
  });
}

function loadSettings() {}

function downloadUpdate() {
  log("UPDATE", "User clicked the 'Update available!' text");
  eventEmitter.emit("download-update");
}

function relaunchTheApp() {
  log(
    "UPDATE",
    "User clicked the 'Pending restart!' text, relaunching the app to install new version"
  );
  eventEmitter.emit("relaunch-check");
}

var windowTitle = "DESTINY 2 OVERLAY";

eventEmitter.addEventListener("update-available", function (version) {
  document.getElementById(
    "titleBarName"
  ).innerHTML = `${windowTitle} - <span class="update-available" onclick="downloadUpdate(); return false;" title="An update (${version}) is available for this application, click here to update to the new version">Update available!</span>`;
});

eventEmitter.addEventListener("update-pending-restart", function (version) {
  document.getElementById(
    "titleBarName"
  ).innerHTML = `${windowTitle} - <span class="update-pending-restart" onclick="relaunchTheApp(); return false;" title="We need to restart the application to apply the new version, click here to restart">Pending restart!</span>`;
});

eventEmitter.addEventListener(
  "main-window-notification",
  function (messageObject) {
    // messageObject { class: string (info, warn, error), message: string }
    // TODO: Add notification message function
  }
);

function authenticateWithBungie() {
  overwolf.utils.openUrlInDefaultBrowser(
    destinyApiClient.getAuthenticationUrl()
  );
}

async function logoutFromBungie() {
  await db.removeItem("destinyToken");
  await db.removeItem("destinyExpires");
  await db.removeItem("destinyRefreshToken");
  await db.removeItem("destinyRefreshTokenExpires");

  eventEmitter.emit("destiny-not-authed");
}

function bindExitButtonEvent(window) {
  document.getElementById("exitButton").addEventListener("click", function () {
    localStorage.removeItem("mainWindow_opened");
    eventEmitter.emit("main-window-closed");
    overwolf.windows.close(window.window.id, function () {});
  });
}

(function () {
  overwolf.windows.getCurrentWindow(async function (window) {
    new DraggableWindow(window.window, document.getElementById("titleBar"));
    bindExitButtonEvent(window);

    overwolf.extensions.current.getManifest(function (app) {
      windowTitle = `${windowTitle} - v${app.meta.version}`;
      document.getElementById("titleBarName").innerHTML = windowTitle;
    });

    document.getElementById("visibleItems").value = await db.getItem(
      "d2-visible-items"
    );

    document.getElementById("trackMilestones").checked = JSON.parse(
      ((await db.getItem("d2-track-milestones")) ?? "true").toString()
    )
      ? "checked"
      : "";
    document.getElementById("trackBounties").checked = JSON.parse(
      ((await db.getItem("d2-track-bounties")) ?? "true").toString()
    )
      ? "checked"
      : "";
    document.getElementById("trackQuests").checked = JSON.parse(
      ((await db.getItem("d2-track-quests")) ?? "true").toString()
    )
      ? "checked"
      : "";
    document.getElementById("trackRecords").checked = JSON.parse(
      ((await db.getItem("d2-track-records")) ?? "true").toString()
    )
      ? "checked"
      : "";

    document
      .getElementById("authenticateWithBungie")
      .removeEventListener("click", authenticateWithBungie);

    document
      .getElementById("authenticateWithBungie")
      .addEventListener("click", authenticateWithBungie);

    document
      .getElementById("logoutFromBungie")
      .removeEventListener("click", logoutFromBungie);

    document
      .getElementById("logoutFromBungie")
      .addEventListener("click", logoutFromBungie);

    document
      .getElementById("visibleItems")
      .addEventListener("change", async (event) => {
        await db.setItem("d2-visible-items", event.target.value);
        eventEmitter.emit(
          "visible-items-changed",
          parseInt(event.target.value)
        );
      });

    document
      .getElementById("trackMilestones")
      .addEventListener("change", async function (event) {
        let checked = event.target.checked;

        await db.setItem("d2-track-milestones", checked);

        eventEmitter.emit("tracked-items-changed");
      });

    document
      .getElementById("trackBounties")
      .addEventListener("change", async function (event) {
        let checked = event.target.checked;

        await db.setItem("d2-track-bounties", checked);

        eventEmitter.emit("tracked-items-changed");
      });

    document
      .getElementById("trackQuests")
      .addEventListener("change", async function (event) {
        let checked = event.target.checked;

        await db.setItem("d2-track-quests", checked);

        eventEmitter.emit("tracked-items-changed");
      });

    document
      .getElementById("trackRecords")
      .addEventListener("change", async function (event) {
        let checked = event.target.checked;

        await db.setItem("d2-track-records", checked);

        eventEmitter.emit("tracked-items-changed");
      });

    setTimeout(async function () {
      let hasAuthed = await destinyApiClient.isAuthenticated();
      if (hasAuthed) {
        document.querySelector("#authenticateWithBungie").style.display =
          "none";
        document.querySelector("#logoutFromBungie").style.display = "";
      } else {
        document.querySelector("#authenticateWithBungie").style.display = "";
        document.querySelector("#logoutFromBungie").style.display = "none";
      }
    }, 100);
  });

  localStorage.setItem("mainWindow_opened", true);
})();
