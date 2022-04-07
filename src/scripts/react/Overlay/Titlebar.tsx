import React, { useEffect, useState } from "react";
import { DraggableWindow } from "../../draggable-window";

export function Titlebar() {
  const [hotKey, setHotKey] = useState("");

  const getHotKeyInfo = () => {
    overwolf.settings.hotkeys.get((hotkeys) => {
      if (hotkeys.success && hotkeys.games["21812"]) {
        setHotKey(hotkeys.games["21812"][0].binding);
      }
    });
  };

  useEffect(() => {
    overwolf.windows.getCurrentWindow(async function (window) {
      new DraggableWindow(window.window, document.getElementById("titleBar"));
    });

    overwolf.settings.hotkeys.onChanged.addListener(getHotKeyInfo);

    getHotKeyInfo();

    return () => {
      overwolf.settings.hotkeys.onChanged.removeListener(getHotKeyInfo);
    };
  }, []);

  return (
    <nav className="navbar bg-dark navbar-dark" id="titleBar">
      <span className="navbar-brand text-white text-bold" id="titleBarName">
        Goal Tracker <small>(Toggle: {hotKey})</small>
      </span>
    </nav>
  );
}
