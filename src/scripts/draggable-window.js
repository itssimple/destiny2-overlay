const SIGNIFICANT_MOUSE_MOVE_THRESHOLD = 1;

/**
 *
 * @param {String} window WindowId from Overwolf
 * @param {HTMLElement} dragElement The element that should be draggable
 */
function DraggableWindow(window, dragElement) {
  this.currentWindow = window;
  this.initialMousePosition = 0;
  this.isMouseDown = false;

  this.onDragStart = function (event) {
    this.isMouseDown = true;
    this.initialMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  this.onMouseMove = function (event) {
    if (!this.isMouseDown) {
      return;
    }

    if (!this._isSignificantMouseMove(event)) {
      return;
    }

    this.isMouseDown = false;

    if (this.currentWindow) {
      overwolf.windows.dragMove(this.currentWindow.id);
    }
  };

  /**
   * check that the mouse is moved a significant distance to prevent
   * unnecessary calls to dragMove
   * @param event mouse event
   * @returns {boolean}
   * @private
   */
  this._isSignificantMouseMove = function (event) {
    if (!this.initialMousePosition) {
      return false;
    }

    const x = event.clientX;
    const y = event.clientY;
    const diffX = Math.abs(x - this.initialMousePosition.x);
    const diffY = Math.abs(y - this.initialMousePosition.y);
    return (
      diffX > SIGNIFICANT_MOUSE_MOVE_THRESHOLD ||
      diffY > SIGNIFICANT_MOUSE_MOVE_THRESHOLD
    );
  };

  dragElement.addEventListener("mousedown", this.onDragStart.bind(this));
  dragElement.addEventListener("mousemove", this.onMouseMove.bind(this));
  dragElement.className = dragElement.className + " draggable";

  return this;
}
