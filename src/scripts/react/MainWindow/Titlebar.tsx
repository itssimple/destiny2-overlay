import React, { useEffect } from "react";
import { DraggableWindow } from "../../draggable-window";
import { EventEmitter } from "../../eventEmitter";

const backgroundWindow = overwolf.windows.getMainWindow();
const eventEmitter = (backgroundWindow as any).eventEmitter as EventEmitter;

export function Titlebar() {
  useEffect(() => {
    var windowTitle = "DESTINY 2 OVERLAY";
    overwolf.windows.getCurrentWindow(async function (window) {
      new DraggableWindow(window.window, document.getElementById("titleBar"));

      overwolf.extensions.current.getManifest(function (app) {
        windowTitle = `${windowTitle} - v${app.meta.version}`;
        document.getElementById("titleBarName")!.innerHTML = windowTitle;
      });

      eventEmitter.addEventListener("update-available", function (version) {
        document.getElementById(
          "titleBarName"
        )!.innerHTML = `${windowTitle} - <span class="update-available" onclick="downloadUpdate(); return false;" title="An update (${version}) is available for this application, click here to update to the new version">Update available!</span>`;
      });

      eventEmitter.addEventListener("update-pending-restart", function (version) {
        document.getElementById(
          "titleBarName"
        )!.innerHTML = `${windowTitle} - <span class="update-pending-restart" onclick="relaunchTheApp(); return false;" title="We need to restart the application to apply the new version, click here to restart">Pending restart!</span>`;
      });
    });
  }, []);

  function closeWindow() {
    localStorage.removeItem("mainWindow_opened");
    eventEmitter.emit("main-window-closed");
    overwolf.windows.getCurrentWindow(async function (window) {
      overwolf.windows.close(window.window.id, function () {});
    });
  }

  return (
    <nav className="navbar bg-dark navbar-dark" id="titleBar">
      <div className="navbar-brand header general" id="titleBarName">
        DESTINY 2 OVERLAY - v0.0.0
      </div>
      <button className="btn btn-sm" id="exitButton" onClick={closeWindow}>
        X
      </button>
    </nav>
  );
}
