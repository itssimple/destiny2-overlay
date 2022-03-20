import React, { useEffect, useState } from "react";
import { EventEmitter } from "../../eventEmitter";
import { Destiny2Database } from "../../indexedDB";
import { LoadingIndicator } from "../components/loadingIndicator";

const intlFormat = new Intl.NumberFormat();

const backgroundWindow = overwolf.windows.getMainWindow();
const eventEmitter = (backgroundWindow as any).eventEmitter as EventEmitter;
const db = (backgroundWindow as any).db as Destiny2Database;

const destinyBaseUrl = "https://www.bungie.net";
var visibleItems = 15;
var trackingItems = {
  milestones: true,
  bounties: true,
  quests: true,
  records: true,
  seasonRank: true,
};

var cachedGoals = [];

export function GoalList() {
  const [visibleGoals, setVisibleGoals] = useState([]);

  useEffect(() => {
    eventEmitter.addEventListener("goal-list-update", updateGoalList);

    eventEmitter.addEventListener("tracked-items-changed", async () => {
      trackingItems = {
        milestones: JSON.parse((await db.getItem("d2-track-milestones")) ?? true),
        bounties: JSON.parse((await db.getItem("d2-track-bounties")) ?? true),
        quests: JSON.parse((await db.getItem("d2-track-quests")) ?? true),
        records: JSON.parse((await db.getItem("d2-track-records")) ?? true),
        seasonRank: JSON.parse((await db.getItem("d2-track-seasonrank")) ?? true),
      };

      if (cachedGoals && cachedGoals.length > 0) {
        updateGoalList(cachedGoals);
      }
    });

    eventEmitter.addEventListener("visible-items-changed", (items) => {
      visibleItems = items;

      if (cachedGoals && cachedGoals.length > 0) {
        updateGoalList(cachedGoals);
      }
    });

    (async function () {
      await loadSettings();
    })();
  }, []);

  function renderProgress(goal) {
    let progress = null;

    if (goal.inProgressValueStyle === 0) {
      if (goal.nextLevelAt === 1) {
        goal.inProgressValueStyle = 2;
      }
    }

    switch (goal.inProgressValueStyle) {
      case 2:
        progress = (
          <span className="badge badge-primary badge-pill float-right">
            {goal.progressToNextLevel == 0 ? "Incomplete" : "Complete"}
          </span>
        );
        break;
      case 3:
        let progressPercent = ((goal.progressToNextLevel / goal.nextLevelAt) * 100).toFixed(0);
        progress = <span className="badge badge-primary badge-pill float-right">{progressPercent} %</span>;
        break;
      case 8:
        progress = "";
        break;
      case 12:
        progress = <span className="badge badge-primary badge-pill float-right">{goal.progressToNextLevel} %</span>;
        break;
      case 6:
      default:
        progress = (
          <span className="badge badge-primary badge-pill float-right">
            {intlFormat.format(goal.progressToNextLevel)} / {intlFormat.format(goal.nextLevelAt)}
          </span>
        );
        break;
    }

    return typeof goal.nextLevelAt !== "undefined" ? <>{progress}</> : null;
  }

  function renderGoalItem(goal) {
    let icon =
      typeof goal.icon !== "undefined" ? (
        <img className="media-object align-self-center mr-1" src={`${destinyBaseUrl}${goal.icon}`} />
      ) : null;

    let expiryDate =
      typeof goal.endDate !== "undefined" ? (
        <>
          <br />
          <i>Ends in {formatTimespan(new Date(), new Date(goal.endDate))}</i>
        </>
      ) : null;

    let progress = renderProgress(goal);

    return (
      <li className="list-group-item d-flex justify-content-between align-items-center">
        {icon}
        <div className="media-body">
          <h5>
            {goal.name}
            {progress}
          </h5>
          {goal.description}
          {expiryDate}
        </div>
      </li>
    );
  }

  async function updateGoalList(goals) {
    let goalsVisible = 0;

    let _visibleGoals = [];

    for (let goal of goals) {
      if (visibleItems > 0 && goalsVisible >= visibleItems) {
        break;
      }

      let addGoal = true;

      switch (goal.type) {
        case "milestone":
          addGoal = trackingItems.milestones;
          break;
        case "quest":
          addGoal = trackingItems.quests;
          break;
        case "bounty":
          addGoal = trackingItems.bounties;
          break;
        case "characterRecord":
          addGoal = trackingItems.records;
          break;
        case "seasonrank":
          addGoal = trackingItems.seasonRank;
          break;
      }

      if (addGoal) {
        _visibleGoals.push(goal);
        goalsVisible++;
      }
    }

    setVisibleGoals(_visibleGoals);
    cachedGoals = goals;
  }

  async function loadSettings() {
    visibleItems = parseInt((await db.getItem("d2-visible-items")) ?? 0);

    trackingItems = {
      milestones: JSON.parse((await db.getItem("d2-track-milestones")) ?? true),
      bounties: JSON.parse((await db.getItem("d2-track-bounties")) ?? true),
      quests: JSON.parse((await db.getItem("d2-track-quests")) ?? true),
      records: JSON.parse((await db.getItem("d2-track-records")) ?? true),
      seasonRank: JSON.parse((await db.getItem("d2-track-seasonrank")) ?? true),
    };
  }

  return (
    <div className="container-fluid h-80" id="main-win-container">
      <ul className="list-unstyled" id="goal-list">
        {visibleGoals.length > 0 ? visibleGoals.map((goal) => renderGoalItem(goal)) : <LoadingIndicator />}
      </ul>
    </div>
  );
}
