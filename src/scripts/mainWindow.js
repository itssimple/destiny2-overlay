/// <reference path="eventEmitter.js" />
/// <reference path="date.js" />
/// <reference path="log.js" />
/// <reference path="utils.js" />
/// <reference path="destiny2/apiClient.js" />
/// <reference path="../../resources/scripts/bootstrap.min.js" />

const backgroundWindow = overwolf.windows.getMainWindow();

/** @type EventEmitter */
const eventEmitter = backgroundWindow.eventEmitter;
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

eventEmitter.addEventListener("game-exited", function () {});

/*
function onOwAdReady() {
  if (!OwAd) {
    // TODO: Handle fallback if the OwAd-API doesn't load
    return;
  }

  overwolfAdvertiseObject = new OwAd(document.getElementById("ow_ad"));
  overwolfAdvertiseObject.addEventListener("ow_internal_rendered", () => {
    overwolfAdvertiseInitialized = true;
  });
}*/

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

var windowTitle = "Destiny 2 Overlay";

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

function sendLogsToDeveloper() {
  return function () {
    let logButton = document.getElementById("send-logs");
    logButton.innerText = "Uploading logs, please wait ...";
    logButton.disabled = true;
    overwolf.utils.uploadClientLogs(function () {
      logButton.innerText = "Logs sent, thank you";
      setTimeout(function () {
        logButton.innerText = "Send logs to the developer";
        logButton.disabled = false;
      }, 5000);
    });
  };
}

function authenticateWithBungie() {
  overwolf.utils.openUrlInDefaultBrowser(
    destinyApiClient.getAuthenticationUrl()
  );
}

function bindExitButtonEvent(window) {
  document.getElementById("exitButton").addEventListener("click", function () {
    localStorage.removeItem("mainWindow_opened");
    overwolf.windows.close(window.window.id, function () {});
  });
}

(function () {
  overwolf.windows.getCurrentWindow(function (window) {
    new DraggableWindow(window.window, document.getElementById("titleBar"));
    bindExitButtonEvent(window);

    overwolf.extensions.current.getManifest(function (app) {
      windowTitle = `${windowTitle} - v${app.meta.version}`;
      document.getElementById("titleBarName").innerHTML = windowTitle;
    });

    document
      .getElementById("send-logs")
      .removeEventListener("click", sendLogsToDeveloper);

    document
      .getElementById("send-logs")
      .addEventListener("click", sendLogsToDeveloper);

    document
      .getElementById("authenticateWithBungie")
      .removeEventListener("click", authenticateWithBungie);

    document
      .getElementById("authenticateWithBungie")
      .addEventListener("click", authenticateWithBungie);
  });

  localStorage.setItem("mainWindow_opened", true);
})();
