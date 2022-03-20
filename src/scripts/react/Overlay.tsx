/// <reference types="@overwolf/types" />

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { Titlebar } from "./Overlay/Titlebar";
import { EventEmitter } from "../eventEmitter";
import { GoalList } from "./Overlay/GoalList";
import { DestinyApiClient } from "../destiny2/apiClient";

import "../../public/css/bootstrap.min.css";
import "../../public/css/overlay-styles.css";

const backgroundWindow = overwolf.windows.getMainWindow();
const destinyApiClient = (backgroundWindow as any).destinyApiClient as DestinyApiClient;
const eventEmitter = (backgroundWindow as any).eventEmitter as EventEmitter;

function Overlay() {
  useEffect(() => {
    // Here we just signal to the rest of the app that we have opened the overlay, so that we can start sending the initial data
    eventEmitter.emit("overlay-opened", {});

    eventEmitter.addEventListener("game-exited", function () {
      overwolf.windows.getCurrentWindow(function (_window) {
        overwolf.windows.close(_window.window.id, function () {});
      });
    });

    setInterval(async function () {
      await destinyApiClient.getTrackableData(true);
    }, 15 * 1000);
  }, []);

  return (
    <>
      <Titlebar />
      <GoalList />
    </>
  );
}

ReactDOM.render(<Overlay />, document.getElementById("root"));
