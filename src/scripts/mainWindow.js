/// <reference path="eventEmitter.js" />
/// <reference path="date.js" />
/// <reference path="log.js" />
/// <reference path="utils.js" />
/// <reference path="destiny2/apiClient.js" />
/// <reference path="../../resources/scripts/bootstrap.min.js" />

const backgroundWindow = overwolf.windows.getMainWindow();

/** @type EventEmitter */
const eventEmitter = backgroundWindow.eventEmitter;

const destinyBaseUrl = "https://www.bungie.net";

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
  return;
  let lastPlayedClass = document.querySelector("#lastPlayedClass");
  let lastPlayedTotalTime = document.querySelector("#lastPlayedTotalTime");

  lastPlayedClass.innerText = `${lastPlayed.genderName} ${lastPlayed.raceName} ${lastPlayed.className}`;
  lastPlayedTotalTime.innerText = `Played ${formatTimespan(
    new Date(),
    new Date(Date.now() + lastPlayed.minutesPlayedTotal * 60 * 1000)
  )}`;
}

eventEmitter.addEventListener("destiny-data-loaded", async function () {
  let namedObject = await destinyApiClient.getNamedDataObject(true);

  await loadGoals("destiny-data-loaded", namedObject);
});

async function loadGoals(loadReason, namedObject) {
  if (
    !destinyApiClient.destinyDataDefinition.DestinyPresentationNodeDefinition
  ) {
    return;
  }

  let depth = 0;

  let triumphPresentation =
    destinyApiClient.destinyDataDefinition.DestinyPresentationNodeDefinition[
      "1163735237"
    ];

  let goalContainer = document.querySelector("#allGoals");
  goalContainer.innerHTML = "";

  for (let childNode of triumphPresentation.children.presentationNodes) {
    let node =
      destinyApiClient.destinyDataDefinition.DestinyPresentationNodeDefinition[
        childNode.presentationNodeHash
      ];

    let categoryHeader = document.createElement("div");
    categoryHeader.classList.add("hud");
    categoryHeader.classList.add("headers");
    categoryHeader.classList.add("translucent");
    categoryHeader.innerText = node.displayProperties.name;

    goalContainer.appendChild(categoryHeader);

    depth++;
    renderSubPresentationNode(node, namedObject, depth);
    depth--;
  }
}

async function renderSubPresentationNode(presentationNode, namedObject, depth) {
  let goalContainer = document.querySelector("#allGoals");

  if (
    presentationNode.children &&
    presentationNode.children.presentationNodes.length > 0
  ) {
    for (let childNode of presentationNode.children.presentationNodes) {
      let subNode =
        destinyApiClient.destinyDataDefinition
          .DestinyPresentationNodeDefinition[childNode.presentationNodeHash];

      let goal = document.createElement("div");
      goal.classList.add("hud");
      goal.classList.add("sub-header");
      goal.classList.add("translucent");
      goal.innerHTML =
        "&gt;&nbsp;".repeat(depth) + subNode.displayProperties.name;

      goalContainer.appendChild(goal);

      renderRecordNodes(subNode, namedObject);
      depth++;
      renderSubPresentationNode(subNode, namedObject, depth);
      depth--;
    }
  }
}

async function renderRecordNodes(presentationNode, namedObject) {
  if (
    !presentationNode.children ||
    presentationNode.children.records.length == 0
  ) {
    return;
  }

  let goalContainer = document.querySelector("#allGoals");

  let recordContainer = document.createElement("div");
  recordContainer.classList.add("goalkeeper");

  for (let childNode of presentationNode.children.records) {
    let subNode =
      destinyApiClient.destinyDataDefinition.DestinyRecordDefinition[
        childNode.recordHash
      ];

    let characterRecord =
      namedObject.characterRecords.records[childNode.recordHash];

    let recordInfo = destinyApiClient.mapHashesToDefinitionsInObject(subNode);

    if (recordInfo) {
      let objectivesHtml = "";

      if (recordInfo.objectiveHashes) {
        for (let objectiveHash of recordInfo.objectiveHashes) {
          let objective =
            destinyApiClient.destinyDataDefinition.DestinyObjectiveDefinition[
              objectiveHash
            ];

          let objectiveInfo =
            destinyApiClient.mapHashesToDefinitionsInObject(objective);

          if (characterRecord && characterRecord.objectives) {
            let objectiveRecord = characterRecord.objectives.find(
              (o) => o.objectiveHash == objectiveHash
            );

            if (objectiveRecord) {
              let objectiveHtml = `<div class="goal-objective">
  <div class="checkbox block">
    <label>
      <input type="checkbox" disabled ${
        objectiveRecord.complete ? "checked" : ""
      } />
      <span>${
        objectiveInfo.progressDescription
          ? objectiveInfo.progressDescription
          : objectiveRecord.objectiveProgressDescription
          ? objectiveRecord.objectiveProgressDescription
          : "Completed"
      }</span>
  </div>
</div>`;

              if (
                !objectiveInfo.progressDescription &&
                !objectiveRecord.objectiveProgressDescription
              ) {
                console.log(
                  recordInfo.displayProperties.name,
                  objectiveInfo,
                  objectiveRecord
                );
              }

              objectivesHtml += objectiveHtml;
            } else {
              let objectiveHtml = `<div class="goal-objective">
  <div class="checkbox block">
    <label>
      <input type="checkbox" disabled />
      <span>${
        objectiveInfo.progressDescription
          ? objectiveInfo.progressDescription
          : objectiveRecord.objectiveProgressDescription
          ? objectiveRecord.objectiveProgressDescription
          : "Completed"
      }</span>
  </div>
</div>`;
              if (
                !objectiveInfo.progressDescription &&
                !objectiveRecord.objectiveProgressDescription
              ) {
                console.log(
                  recordInfo.displayProperties.name,
                  objectiveInfo,
                  objectiveRecord
                );
              }
              objectivesHtml += objectiveHtml;
            }
          } else {
            let objectiveHtml = `<div class="goal-objective">
  <div class="checkbox block">
    <label>
      <input type="checkbox" disabled />
      <span>${
        objectiveInfo.progressDescription
          ? objectiveInfo.progressDescription
          : "Completed"
      }</span>
  </div>
</div>`;
            if (!objectiveInfo.progressDescription) {
              console.log(
                recordInfo.displayProperties.name,
                objectiveInfo,
                objective
              );
            }
            objectivesHtml += objectiveHtml;
          }
        }
      }

      let record = document.createElement("div");
      record.classList.add("goal");

      record.innerHTML = `
      <div class="goal-image">
        <img src="${destinyBaseUrl}${recordInfo.displayProperties.icon}" />
      </div>
      <div class="goal-info">
        <div class="goal-name">${recordInfo.displayProperties.name}</div>
        <div class="goal-description">${recordInfo.displayProperties.description}</div>
        ${objectivesHtml}
      </div>`;

      recordContainer.appendChild(record);
    }
  }

  goalContainer.appendChild(recordContainer);
}

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

async function loadSettings() {
  document.getElementById("visibleItems").value = await db.getItem(
    "d2-visible-items"
  );

  document.getElementById("trackSeasonRank").checked = JSON.parse(
    ((await db.getItem("d2-track-seasonrank")) ?? "true").toString()
  )
    ? "checked"
    : "";

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
}

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

(async function () {
  overwolf.windows.getCurrentWindow(async function (window) {
    new DraggableWindow(window.window, document.getElementById("titleBar"));
    bindExitButtonEvent(window);

    overwolf.extensions.current.getManifest(function (app) {
      windowTitle = `${windowTitle} - v${app.meta.version}`;
      document.getElementById("titleBarName").innerHTML = windowTitle;
    });

    await loadSettings();

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
      .getElementById("trackSeasonRank")
      .addEventListener("change", async function (event) {
        let checked = event.target.checked;

        await db.setItem("d2-track-seasonrank", checked);

        eventEmitter.emit("tracked-items-changed");
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

      await loadGoals("open-window");
    }, 100);
  });

  localStorage.setItem("mainWindow_opened", true);
})();
