(function () {
  overwolf.windows.getCurrentWindow(function (window) {
    new DraggableWindow(window.window, document.getElementById("titleBar"));
  });
})();
