/// <reference path="eventEmitter.js" />
/// <reference path="date.js" />
/// <reference path="log.js" />
/// <reference path="utils.js" />
/// <reference path="destiny2/apiClient.js" />
/// <reference path="../../resources/scripts/bootstrap.min.js" />

const backgroundWindow = overwolf.windows.getMainWindow();

const destinyApiClient = backgroundWindow.destinyApiClient;

const eventEmitter = backgroundWindow.eventEmitter;

eventEmitter.addEventListener("loading-text", (data) => {
  const loadingActivity = document.querySelector("#loading-activity");
  loadingActivity.innerText = data;
});

const loadingActivity = document.querySelector("#loading-activity");
loadingActivity.innerText = "Checking manifest";

destinyApiClient.checkManifestVersion().then(async () => {
  destinyApiClient
    .checkStoredDefinitions(false)
    .then(async (missingDefinitions) => {
      const loadingActivity = document.querySelector("#loading-activity");
      if (missingDefinitions.length > 0) {
        loadingActivity.innerText = "Downloading definitions...";
        await destinyApiClient.checkStoredDefinitions(true);
      }

      loadingActivity.innerText = "Loading data...";
      destinyApiClient.loadDataFromStorage().then(() => {
        loadingActivity.innerText = "Loading data... done";
        setTimeout(() => {
          loadingActivity.innerText = "Opening application...";
          eventEmitter.emit("manifests-loaded");
        }, 1000);
      });
    });
});
