/// <reference path="eventEmitter.js" />
/// <reference path="date.js" />
/// <reference path="log.js" />
/// <reference path="utils.js" />
/// <reference path="destiny2/apiClient.js" />
/// <reference path="../../resources/scripts/bootstrap.min.js" />

const backgroundWindow = overwolf.windows.getMainWindow();

const destinyBaseUrl = "https://www.bungie.net";

/** @type EventEmitter */
const eventEmitter = backgroundWindow.eventEmitter;
const db = backgroundWindow.db;
const destinyApiClient = backgroundWindow.destinyApiClient;

const intlFormat = new Intl.NumberFormat();

function renderProgress(goal) {
  let progress = "";

  if (goal.inProgressValueStyle === 0) {
    if (goal.nextLevelAt === 1) {
      goal.inProgressValueStyle = 2;
    }
  }

  switch (goal.inProgressValueStyle) {
    case 2:
      progress = `<span class="badge badge-primary badge-pill float-right">${
        goal.progressToNextLevel == 0 ? "Incomplete" : "Complete"
      }</span>`;
      break;
    case 3:
      let progressPercent = (
        (goal.progressToNextLevel / goal.nextLevelAt) *
        100
      ).toFixed(0);
      progress = `<span class="badge badge-primary badge-pill float-right">${progressPercent} %</span>`;
      break;
    case 8:
      progress = "";
      break;
    case 12:
      progress = `<span class="badge badge-primary badge-pill float-right">${goal.progressToNextLevel} %</span>`;
      break;
    case 6:
    default:
      progress = `<span class="badge badge-primary badge-pill float-right">${intlFormat.format(
        goal.progressToNextLevel
      )} / ${intlFormat.format(goal.nextLevelAt)}</span>`;
      break;
  }

  return typeof goal.nextLevelAt !== "undefined" ? ` ${progress}` : "";
}

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

  let progress = renderProgress(goal);

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

async function updateGoalList(goals) {
  await loadSettings();

  var goalList = document.getElementById("goal-list");

  goalList.innerHTML = "";

  let goalsVisible = 0;

  for (let goal of goals) {
    if (window.visibleItems > 0 && goalsVisible >= window.visibleItems) {
      break;
    }

    let addGoal = true;

    switch (goal.type) {
      case "milestone":
        addGoal = window.trackingItems.milestones;
        break;
      case "quest":
        addGoal = window.trackingItems.quests;
        break;
      case "bounty":
        addGoal = window.trackingItems.bounties;
        break;
      case "characterRecord":
        addGoal = window.trackingItems.records;
        break;
    }

    if (addGoal) {
      goalList.appendChild(renderGoalItem(goal));
      goalsVisible++;
    }
  }

  window.cachedGoals = goals;

  //log("DEBUG", "Goals updated", goals, new Date().toISOString());
}

eventEmitter.addEventListener("goal-list-update", updateGoalList);

eventEmitter.addEventListener("tracked-items-changed", () => {
  if (window.cachedGoals && window.cachedGoals.length > 0) {
    updateGoalList(window.cachedGoals);
  }
});

async function loadSettings() {
  window.visibleItems = parseInt((await db.getItem("d2-visible-items")) ?? 0);

  window.trackingItems = {
    milestones: JSON.parse((await db.getItem("d2-track-milestones")) ?? true),
    bounties: JSON.parse((await db.getItem("d2-track-bounties")) ?? true),
    quests: JSON.parse((await db.getItem("d2-track-quests")) ?? true),
    records: JSON.parse((await db.getItem("d2-track-records")) ?? true),
  };
}

(function () {
  overwolf.windows.getCurrentWindow(async function (_window) {
    new DraggableWindow(
      _window.window,
      document.getElementById("titleBar"),
      "overlay"
    );

    await loadSettings();
  });
})();

// Here we just signal to the rest of the app that we have opened the overlay, so that we can start sending the initial data
eventEmitter.emit("overlay-opened", {});

eventEmitter.addEventListener("game-exited", function () {
  overwolf.windows.getCurrentWindow(function (_window) {
    overwolf.windows.close(_window.window.id, function () {});
  });
});

eventEmitter.addEventListener("visible-items-changed", (visibleItems) => {
  window.visibleItems = visibleItems;

  if (window.cachedGoals && window.cachedGoals.length > 0) {
    updateGoalList(window.cachedGoals);
  }
});

setInterval(async function () {
  await destinyApiClient.getTrackableData(true);
}, 15 * 1000);
