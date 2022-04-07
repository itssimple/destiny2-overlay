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

    loadCharacterHistory();
  }, []);

  async function loadCharacterHistory() {
    let character = await destinyApiClient.getLastPlayedCharacter();
    let characterHistory = await destinyApiClient.loadCharacterHistory(
      character.characterInfo.membershipId,
      character.characterInfo.characterId
    );
  }

  async function setLastPlayedCharacter(lastPlayed) {
    let tempGoalContainer = document.querySelector("#allGoals");

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

    await setCharacterHistory(lastPlayed, tempGoalContainer);
  }

  async function setCharacterHistory(lastPlayed, tempGoalContainer) {
    let activityData = await db.getStorageItems(
      "playerActivity",
      (item) => item.value.characterId == lastPlayed.characterId
    );
    let totalAssists = 0,
      totalKills = 0,
      totalDeaths = 0;

    for (let activity of activityData) {
      totalAssists += activity.value.activity.values.assists.basic.value;
      totalKills += activity.value.activity.values.kills.basic.value;
      totalDeaths += activity.value.activity.values.deaths.basic.value;
    }

    let playerStats = document.createElement("div");
    playerStats.classList.add("header");
    playerStats.classList.add("general");
    playerStats.innerText = "Character statistics";

    tempGoalContainer.appendChild(playerStats);

    let assists = document.createElement("div");
    assists.classList.add("fui");
    assists.classList.add("sub-title");
    assists.innerText = "Assists";

    tempGoalContainer.appendChild(assists);

    let assistsValue = document.createElement("div");
    assistsValue.classList.add("fui");
    assistsValue.classList.add("body");
    assistsValue.classList.add("numbers");
    assistsValue.innerText = totalAssists.toLocaleString(undefined, { maximumFractionDigits: 0 });

    tempGoalContainer.appendChild(assistsValue);

    let kills = document.createElement("div");
    kills.classList.add("fui");
    kills.classList.add("sub-title");
    kills.innerText = "Kills";

    tempGoalContainer.appendChild(kills);

    let killsValue = document.createElement("div");
    killsValue.classList.add("fui");
    killsValue.classList.add("body");
    killsValue.classList.add("numbers");
    killsValue.innerText = totalKills.toLocaleString(undefined, { maximumFractionDigits: 0 });

    tempGoalContainer.appendChild(killsValue);

    let deaths = document.createElement("div");
    deaths.classList.add("fui");
    deaths.classList.add("sub-title");
    deaths.innerText = "Deaths";

    tempGoalContainer.appendChild(deaths);

    let deathsValue = document.createElement("div");
    deathsValue.classList.add("fui");
    deathsValue.classList.add("body");
    deathsValue.classList.add("numbers");
    deathsValue.innerText = totalDeaths.toLocaleString(undefined, { maximumFractionDigits: 0 });

    tempGoalContainer.appendChild(deathsValue);
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
