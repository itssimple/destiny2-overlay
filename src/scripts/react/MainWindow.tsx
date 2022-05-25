/// <reference types="@overwolf/types" />

import React, { useEffect } from "react";
import ReactDOM from "react-dom";

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

overwolf.extensions.current.getManifest(function (app) {
  Sentry.init({
    dsn: "https://cd1d4d46d6b14f3ea41d6ede28ad95a7@sentry.nolifeking85.tv/2",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
    release: app.meta.version,
  });
});

import "../../public/css/bootstrap.min.css";
import "../../public/css/main-window.css";
import "../../public/css/window-styles.css";
import "../../public/css/destiny2.css";
import { NavigationTabs } from "./MainWindow/NavigationTabs";
import { Dashboard } from "./MainWindow/Dashboard";

import { EventEmitter } from "../eventEmitter";
import { DestinyApiClient } from "../destiny2/apiClient";
import { Settings } from "./MainWindow/Settings";
import { Changelog } from "./MainWindow/Changelog";
import { Titlebar } from "./MainWindow/Titlebar.jsx";
import { useOnlineIndicator } from "./components/useOnlineIndicator";

const backgroundWindow = overwolf.windows.getMainWindow();
const destinyApiClient = (backgroundWindow as any).destinyApiClient as DestinyApiClient;
const eventEmitter = (backgroundWindow as any).eventEmitter as EventEmitter;

function MainWindow() {
  function loadDashData() {
    setTimeout(async function () {
      let hasAuthed = await destinyApiClient.isAuthenticated();
      if (hasAuthed) {
        await loadGoals("window-opened", await destinyApiClient.getNamedDataObject(false));
      }
    }, 100);

    localStorage.setItem("mainWindow_opened", "true");

    eventEmitter.addEventListener("destiny-data-loaded", async function () {
      await loadGoals("destiny-data-loaded", await destinyApiClient.getNamedDataObject(false));
    });
  }
  useEffect(() => {
    loadDashData();
  }, []);

  useEffect(() => {
    window.addEventListener("online", loadDashData);

    return () => {
      window.removeEventListener("online", loadDashData);
    };
  }, []);

  async function loadGoals(loadReason, namedObject) {
    if (!destinyApiClient.destinyDataDefinition.DestinyPresentationNodeDefinition) {
      return;
    }

    return;

    let depth = 0;

    let triumphPresentation = destinyApiClient.destinyDataDefinition.DestinyPresentationNodeDefinition["1163735237"];

    let goalContainer = document.querySelector("#allGoals");
    goalContainer.innerHTML = "";

    for (let childNode of triumphPresentation.children.presentationNodes) {
      let node =
        destinyApiClient.destinyDataDefinition.DestinyPresentationNodeDefinition[childNode.presentationNodeHash];

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

    if (presentationNode.children && presentationNode.children.presentationNodes.length > 0) {
      for (let childNode of presentationNode.children.presentationNodes) {
        let subNode =
          destinyApiClient.destinyDataDefinition.DestinyPresentationNodeDefinition[childNode.presentationNodeHash];

        let goal = document.createElement("div");
        goal.classList.add("hud");
        goal.classList.add("sub-header");
        goal.classList.add("translucent");
        goal.innerHTML = "&gt;&nbsp;".repeat(depth) + subNode.displayProperties.name;

        goalContainer.appendChild(goal);

        renderRecordNodes(subNode, namedObject);
        depth++;
        renderSubPresentationNode(subNode, namedObject, depth);
        depth--;
      }
    }
  }

  async function renderRecordNodes(presentationNode, namedObject) {
    if (!presentationNode.children || presentationNode.children.records.length == 0) {
      return;
    }

    let goalContainer = document.querySelector("#allGoals");

    let recordContainer = document.createElement("div");
    recordContainer.classList.add("goalkeeper");

    for (let childNode of presentationNode.children.records) {
      let subNode = destinyApiClient.destinyDataDefinition.DestinyRecordDefinition[childNode.recordHash];

      let characterRecord = namedObject.characterRecords.records[childNode.recordHash];

      let recordInfo = destinyApiClient.mapHashesToDefinitionsInObject(subNode);

      if (recordInfo) {
        let objectivesHtml = "";

        if (recordInfo.objectiveHashes) {
          for (let objectiveHash of recordInfo.objectiveHashes) {
            let objective = destinyApiClient.destinyDataDefinition.DestinyObjectiveDefinition[objectiveHash];

            let objectiveInfo = destinyApiClient.mapHashesToDefinitionsInObject(objective);

            if (characterRecord && characterRecord.objectives) {
              let objectiveRecord = characterRecord.objectives.find((o) => o.objectiveHash == objectiveHash);

              if (objectiveRecord) {
                let objectiveHtml = `<div class="goal-objective">
    <div class="checkbox block">
      <label>
        <input type="checkbox" disabled ${objectiveRecord.complete ? "checked" : ""} />
        <span>${
          objectiveInfo.progressDescription
            ? objectiveInfo.progressDescription
            : objectiveRecord.objectiveProgressDescription
            ? objectiveRecord.objectiveProgressDescription
            : "Completed"
        }</span>
    </div>
  </div>`;

                if (!objectiveInfo.progressDescription && !objectiveRecord.objectiveProgressDescription) {
                  console.log(recordInfo.displayProperties.name, objectiveInfo, objectiveRecord);
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
                if (!objectiveInfo.progressDescription && !objectiveRecord.objectiveProgressDescription) {
                  console.log(recordInfo.displayProperties.name, objectiveInfo, objectiveRecord);
                }
                objectivesHtml += objectiveHtml;
              }
            } else {
              let objectiveHtml = `<div class="goal-objective">
    <div class="checkbox block">
      <label>
        <input type="checkbox" disabled />
        <span>${objectiveInfo.progressDescription ? objectiveInfo.progressDescription : "Completed"}</span>
    </div>
  </div>`;
              if (!objectiveInfo.progressDescription) {
                console.log(recordInfo.displayProperties.name, objectiveInfo, objective);
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

  const isOnline = useOnlineIndicator();

  return (
    <>
      <Titlebar />
      <NavigationTabs />
      <div className="container-fluid h-80" id="main-win-container">
        <div className="tab-content" id="main-tabcontent">
          {isOnline ? (
            <>
              <Dashboard />
              <Settings />
              <Changelog />
            </>
          ) : (
            <div
              className="tab-pane"
              id="no-internet"
              role="tabpanel"
              aria-labelledby="no-internet-tab"
              style={{
                display: "unset",
              }}
            >
              <div className="row h-100">
                <div className="col-12 pt-2">
                  <div className="card text-white mb-3">
                    <div className="card-header fui sub-title">INTERNET REQUIRED</div>
                    <div className="card-body">
                      To be able to use this application, you need an internet connection.
                      <br />
                      Please reconnect to the internet again.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

ReactDOM.render(<MainWindow />, document.getElementById("root"));
