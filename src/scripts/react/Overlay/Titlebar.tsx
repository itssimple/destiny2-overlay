import React, { useEffect } from "react";
import { DraggableWindow } from "../../draggable-window";

export function Titlebar() {
  useEffect(() => {
    overwolf.windows.getCurrentWindow(async function (window) {
      new DraggableWindow(window.window, document.getElementById("titleBar"));
    });
  }, []);
  return (
    <nav className="navbar bg-dark navbar-dark" id="titleBar">
      <span className="navbar-brand text-white text-bold" id="titleBarName">
        Destiny 2 - Goal Tracker
      </span>
    </nav>
  );
}
