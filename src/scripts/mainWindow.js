/// <reference path="eventEmitter.js" />
/// <reference path="date.js" />
/// <reference path="utils.js" />

const backgroundWindow = overwolf.windows.getMainWindow();

/** @type EventEmitter */
const eventEmitter = backgroundWindow.eventEmitter;

eventEmitter.addEventListener("game-launched", function (game) {});
eventEmitter.addEventListener("game-exited", function () {});

var overwolfAdvertiseObject = null;
var overwolfAdvertiseInitialized = false;

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

function downloadUpdate() {
  log("UPDATE", "User clicked the 'Update available!' text");
  eventEmitter.emit("download-update");
}

function relaunchTheApp() {
  log("UPDATE", "User clicked the 'Pending restart!' text, relaunching the app to install new version");
  eventEmitter.emit("relaunch-check");
}

eventEmitter.addEventListener("main-window-notification", function (messageObject) {
  overwolf.notifications.showToastNotification(
    {
      header: messageObject.title,
      texts: [messageObject.message],
    },
    () => {}
  );
});
