import React, { useEffect } from "react";
import { DestinyApiClient } from "../../destiny2/apiClient";
import { EventEmitter } from "../../eventEmitter";

const backgroundWindow = overwolf.windows.getMainWindow();
const destinyApiClient = (backgroundWindow as any).destinyApiClient as DestinyApiClient;
const eventEmitter = (backgroundWindow as any).eventEmitter as EventEmitter;

export function Dashboard() {
  useEffect(() => {
    eventEmitter.addEventListener("destiny2-api-update", function (namedDataObject) {
      let lastPlayedCharacter = namedDataObject.characterInfo;

      setLastPlayedCharacter(lastPlayedCharacter);
    });
  }, []);

  function setLastPlayedCharacter(lastPlayed) {
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
