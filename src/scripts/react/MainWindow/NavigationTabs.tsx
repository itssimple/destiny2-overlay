/// <reference types="@overwolf/types" />

import React, { useEffect } from "react";
import { DestinyApiClient } from "../../destiny2/apiClient";
import { EventEmitter } from "../../eventEmitter";
import { Destiny2Database } from "../../indexedDB";

const backgroundWindow = overwolf.windows.getMainWindow();
const destinyApiClient = (backgroundWindow as any).destinyApiClient as DestinyApiClient;
const eventEmitter = (backgroundWindow as any).eventEmitter as EventEmitter;
const db = (backgroundWindow as any).db as Destiny2Database;

export function NavigationTabs() {
  useEffect(() => {
    setTimeout(async function () {
      let hasAuthed = await destinyApiClient.isAuthenticated();
      if (hasAuthed) {
        document.querySelector("#authenticateWithBungie").style.display = "none";
        document.querySelector("#logoutFromBungie").style.display = "";
      } else {
        document.querySelector("#authenticateWithBungie").style.display = "";
        document.querySelector("#logoutFromBungie").style.display = "none";
        document.querySelector("#allGoals").innerHTML =
          "<h1>Authenticate with Bungie to see your latest played character and other stats</h1>";
      }
    });

    eventEmitter.addEventListener("auth-successful", function () {
      document.querySelector("#authenticateWithBungie").style.display = "none";
      document.querySelector("#logoutFromBungie").style.display = "";
    });

    eventEmitter.addEventListener("destiny-not-authed", function () {
      document.querySelector("#authenticateWithBungie").style.display = "";
      document.querySelector("#logoutFromBungie").style.display = "none";

      document.querySelector("#allGoals").innerHTML =
        "<h1>Authenticate with Bungie to see your latest played character</h1>";
    });
  }, []);

  function authenticateWithBungie() {
    overwolf.utils.openUrlInDefaultBrowser(destinyApiClient.getAuthenticationUrl());
  }

  async function logoutFromBungie() {
    await db.removeItem("destinyToken");
    await db.removeItem("destinyExpires");
    await db.removeItem("destinyRefreshToken");
    await db.removeItem("destinyRefreshTokenExpires");
    await db.removeItem("destinyBungieMembershipId");

    await db.removeItem("destiny-profile");
    await db.removeItem("destiny-linkedProfiles");

    eventEmitter.emit("destiny-logout");

    eventEmitter.emit("destiny-not-authed");
  }

  return (
    <ul className="nav nav-tabs" id="main-navigation" role="tablist">
      <li className="nav-item fui sub-title" role="presentation">
        <a
          className="nav-link active"
          id="home-tab"
          data-toggle="tab"
          href="#home"
          role="tab"
          aria-controls="home"
          aria-selected="true"
        >
          DASHBOARD
        </a>
      </li>
      <li className="nav-item fui sub-title" role="presentation">
        <a
          className="nav-link"
          id="settings-tab"
          data-toggle="tab"
          href="#settings"
          aria-controls="settings"
          aria-selected="true"
        >
          SETTINGS
        </a>
      </li>
      <li className="nav-item fui sub-title" role="presentation">
        <a
          className="nav-link"
          id="changelog-tab"
          data-toggle="tab"
          href="#changelog"
          aria-controls="changelog"
          aria-selected="true"
        >
          CHANGELOG
        </a>
      </li>
      <button
        className="btn btn-primary"
        id="authenticateWithBungie"
        onClick={authenticateWithBungie}
        style={{ display: "none" }}
      >
        Authenticate with Bungie.net
      </button>
      <button className="btn btn-primary" id="logoutFromBungie" onClick={logoutFromBungie} style={{ display: "none" }}>
        Log out from Bungie.net
      </button>
    </ul>
  );
}
