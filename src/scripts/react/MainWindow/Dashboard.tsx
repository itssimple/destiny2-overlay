import React, { useEffect } from "react";
import { DestinyApiClient } from "../../destiny2/apiClient";
import { EventEmitter } from "../../eventEmitter";
import { Destiny2Database } from "../../indexedDB";

const backgroundWindow = overwolf.windows.getMainWindow();
const destinyApiClient = (backgroundWindow as any).destinyApiClient as DestinyApiClient;
const eventEmitter = (backgroundWindow as any).eventEmitter as EventEmitter;
const db = (backgroundWindow as any).db as Destiny2Database;

export function Dashboard() {
  useEffect(() => {
    eventEmitter.addEventListener("destiny2-api-update", function (namedDataObject) {
      let lastPlayedCharacter = namedDataObject.characterInfo;

      setLastPlayedCharacter(lastPlayedCharacter);
    });

    eventEmitter.addEventListener("character-history-loading", async (characterData) => {
      let character = await destinyApiClient.getLastPlayedCharacter();
      setCharacterHistory(character.characterInfo);
    });

    eventEmitter.addEventListener("character-history-partial-loaded", async (characterData) => {
      let character = await destinyApiClient.getLastPlayedCharacter();
      setCharacterHistory(character.characterInfo);
    });

    eventEmitter.addEventListener("character-history-loaded", async (characterData) => {
      let character = await destinyApiClient.getLastPlayedCharacter();
      setCharacterHistory(character.characterInfo);
    });
  }, []);

  async function setLastPlayedCharacter(lastPlayed) {
    let tempGoalContainer: Element | null = document.querySelector("#allGoals");
    if (tempGoalContainer) {
      tempGoalContainer.innerHTML = "";

      let lastPlayedCharacter = document.createElement("div");
      lastPlayedCharacter.classList.add("hud");
      lastPlayedCharacter.classList.add("translucent");
      lastPlayedCharacter.innerText = `${destinyApiClient.profile.profile.data.userInfo.bungieGlobalDisplayName}#${destinyApiClient.profile.profile.data.userInfo.bungieGlobalDisplayNameCode} (${lastPlayed.light})`;

      lastPlayedCharacter.setAttribute(
        "style",
        `
    background-image: url("https://www.bungie.net${lastPlayed.emblemBackgroundPath}");
    background-repeat: no-repeat;
    padding-left: 96px;
    padding-top: 18px;
    height: 96px;
    font-size: 24px;
    `
      );

      let lastPlayedClass = document.createElement("div");
      lastPlayedClass.classList.add("hud");
      lastPlayedClass.classList.add("sub-header");
      lastPlayedClass.innerHTML = `${lastPlayed.raceName} ${lastPlayed.className}, Played ${formatTimespan(
        new Date(),
        new Date(Date.now() + lastPlayed.minutesPlayedTotal * 60 * 1000)
      )}`;

      lastPlayedCharacter.appendChild(lastPlayedClass);
      tempGoalContainer.appendChild(lastPlayedCharacter);

      await setCharacterHistory(lastPlayed);
    }
  }

  async function setCharacterHistory(lastPlayed) {
    let tempGoalContainer: Element | null = document.querySelector("#allGoals");
    if (tempGoalContainer) {
      let dashboardContainer = document.createElement("div");
      dashboardContainer.classList.add("dashboard-container");

      let activityData = await db.getStorageItems(
        "playerActivity",
        (item) => item.value.characterId == lastPlayed.characterId
      );

      let totalAssists = 0,
        totalKills = 0,
        totalDeaths = 0;

      if (activityData.length == 0) {
        let noData = document.createElement("div");
        noData.classList.add("hud");
        noData.classList.add("translucent");
        noData.innerText = "No data available, data will be fetched in the background.";
        dashboardContainer.appendChild(noData);

        let oldContainer = tempGoalContainer.querySelector(".dashboard-container");
        oldContainer?.remove();

        tempGoalContainer.appendChild(dashboardContainer);

        return;
      }

      for (let activity of activityData) {
        totalAssists += activity.value.activity.values.assists.basic.value;
        totalKills += activity.value.activity.values.kills.basic.value;
        totalDeaths += activity.value.activity.values.deaths.basic.value;
      }

      let playerStats = document.createElement("div");
      playerStats.classList.add("header");
      playerStats.classList.add("general");
      playerStats.innerText = `Character statistics (${activityData.length} activities)`;

      dashboardContainer.appendChild(playerStats);

      let assists = document.createElement("div");
      assists.classList.add("fui");
      assists.classList.add("sub-title");
      assists.innerText = "Assists";

      dashboardContainer.appendChild(assists);

      let assistsValue = document.createElement("div");
      assistsValue.classList.add("fui");
      assistsValue.classList.add("body");
      assistsValue.classList.add("numbers");
      assistsValue.innerText = totalAssists.toLocaleString(undefined, { maximumFractionDigits: 0 });

      dashboardContainer.appendChild(assistsValue);

      let kills = document.createElement("div");
      kills.classList.add("fui");
      kills.classList.add("sub-title");
      kills.innerText = "Kills";

      dashboardContainer.appendChild(kills);

      let killsValue = document.createElement("div");
      killsValue.classList.add("fui");
      killsValue.classList.add("body");
      killsValue.classList.add("numbers");
      killsValue.innerText = totalKills.toLocaleString(undefined, { maximumFractionDigits: 0 });

      dashboardContainer.appendChild(killsValue);

      let deaths = document.createElement("div");
      deaths.classList.add("fui");
      deaths.classList.add("sub-title");
      deaths.innerText = "Deaths";

      dashboardContainer.appendChild(deaths);

      let deathsValue = document.createElement("div");
      deathsValue.classList.add("fui");
      deathsValue.classList.add("body");
      deathsValue.classList.add("numbers");
      deathsValue.innerText = totalDeaths.toLocaleString(undefined, { maximumFractionDigits: 0 });

      dashboardContainer.appendChild(deathsValue);

      let oldContainer = tempGoalContainer.querySelector(".dashboard-container");
      oldContainer?.remove();

      tempGoalContainer.appendChild(dashboardContainer);
    }
  }

  return (
    <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
      <div className="row h-100">
        <div className="col-12 pt-2">
          <div className="card text-white mb-3" id="main-card">
            <div className="card-header fui sub-title">LAST PLAYED CHARACTER</div>
            <div
              className="card-body destiny"
              id="allGoals"
              style={{
                minHeight: "527px",
                maxHeight: "527px",
                overflow: "auto",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
