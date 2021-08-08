/// <reference path="eventEmitter.js" />
/// <reference path="date.js" />
/// <reference path="log.js" />
/// <reference path="utils.js" />
/// <reference path="../../resources/scripts/bootstrap.min.js" />

const backgroundWindow = overwolf.windows.getMainWindow();

const destinyBaseUrl = "https://www.bungie.net";

/** @type EventEmitter */
const eventEmitter = backgroundWindow.eventEmitter;
const db = backgroundWindow.db;
const destinyApiClient = backgroundWindow.destinyApiClient;

const intlFormat = new Intl.NumberFormat();

function renderGoalItem(goal) {
  let icon =
    typeof goal.icon !== "undefined"
      ? `<img class="media-object align-self-center mr-1" src="${destinyBaseUrl}${goal.icon}" />`
      : "";

  let expiryDate =
    typeof goal.endDate !== "undefined"
      ? `<br /><i>Ends in ${formatTimespan(
          new Date(),
          new Date(goal.endDate)
        )}</i>`
      : "";

  let progress =
    typeof goal.nextLevelAt !== "undefined"
      ? ` <span class="badge badge-primary badge-pill float-right">${intlFormat.format(
          goal.progressToNextLevel
        )} / ${intlFormat.format(goal.nextLevelAt)}</span>`
      : "";

  let listItem = document.createElement("div");
  listItem.innerHTML = `<li class="list-group-item d-flex justify-content-between align-items-center">
  ${icon}
  <div class="media-body">
    <h5>${goal.name}${progress}</h5>
    ${goal.description}
    ${expiryDate}
  </div>
</li>`;

  return listItem.children[0];
}

eventEmitter.addEventListener("goal-list-update", function (goals) {
  var goalList = document.getElementById("goal-list");

  goalList.innerHTML = "";

  for (let goal of goals) {
    goalList.appendChild(renderGoalItem(goal));
  }

  //log("DEBUG", "Goals updated", goals, new Date().toISOString());
});

(function () {
  overwolf.windows.getCurrentWindow(function (window) {
    new DraggableWindow(window.window, document.getElementById("titleBar"));
  });
})();

// Here we just signal to the rest of the app that we have opened the overlay, so that we can start sending the initial data
eventEmitter.emit("overlay-opened", {});

setInterval(async function () {
  await destinyApiClient.getTrackableData(true);
}, 30 * 1000);
