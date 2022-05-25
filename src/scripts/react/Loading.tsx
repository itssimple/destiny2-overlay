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

import { LoadingIndicator } from "./components/loadingIndicator";

import { DestinyApiClient } from "../destiny2/apiClient";
import { EventEmitter } from "../eventEmitter";

import "../../public/css/bootstrap.min.css";
import "../../public/css/main-window.css";
import "../../public/css/window-styles.css";

function LoadingWindow() {
  useEffect(() => {
    const backgroundWindow = overwolf.windows.getMainWindow();

    const eventEmitter = (backgroundWindow as any).eventEmitter as EventEmitter;

    eventEmitter.addEventListener("loading-text", (data) => {
      const loadingActivity = document.querySelector("#loading-activity");
      loadingActivity.textContent = data;
    });

    // check if browser is online
    if (!navigator.onLine) {
      eventEmitter.emit("loading-text", "No internet connection, exiting...");
      setTimeout(function () {
        eventEmitter.emit("shutdown", "No internet connection available.");
      }, 5000);
    } else {
      const destinyApiClient = (backgroundWindow as any).destinyApiClient as DestinyApiClient;

      const loadingActivity = document.querySelector("#loading-activity");
      loadingActivity.textContent = "Checking manifest";

      destinyApiClient.checkManifestVersion().then(async () => {
        destinyApiClient.checkStoredDefinitions(false).then(async (missingDefinitions) => {
          const loadingActivity = document.querySelector("#loading-activity");
          if (missingDefinitions.length > 0) {
            loadingActivity.textContent = "Downloading definitions...";
            await destinyApiClient.checkStoredDefinitions(true);
          }

          loadingActivity.textContent = "Loading data...";
          destinyApiClient
            .loadDataFromStorage()
            .then(() => {
              loadingActivity.textContent = "Loading data... done";
              setTimeout(() => {
                loadingActivity.textContent = "Opening application...";
                eventEmitter.emit("manifests-loaded");
              }, 1000);
            })
            .catch((error) => {
              loadingActivity.textContent = "Loading data... failed. Try again later";
              setTimeout(() => {
                eventEmitter.emit("shutdown", error);
              }, 5000);
            });
        });
      });
    }
  }, []);

  return (
    <>
      <LoadingIndicator />
      <div className="loading-text">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1>Loading</h1>
              <h3 id="loading-activity">Please wait while we load the application</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ReactDOM.render(<LoadingWindow />, document.getElementById("root"));
