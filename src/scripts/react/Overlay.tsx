/// <reference types="@overwolf/types" />

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "https://cd1d4d46d6b14f3ea41d6ede28ad95a7@sentry.nolifeking85.tv/2",
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

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

    let intervalTimer = setInterval(async function () {
      await destinyApiClient.getTrackableData(true);
    }, 15 * 1000);

    return () => clearInterval(intervalTimer);
  }, []);

  return (
    <>
      <Titlebar />
      <GoalList />
    </>
  );
}

ReactDOM.render(<Overlay />, document.getElementById("root"));
