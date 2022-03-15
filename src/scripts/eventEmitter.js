class EventEmitter {
  constructor() {
    this.eventListeners = [];

    /**
     * Listen to an event sent from this event emitter
     * @param {String} eventName The event that you want to listen to
     * @param {CallableFunction} eventHandler The method that should run whenever the event occurs
     */
    this.addEventListener = function (eventName, eventHandler) {
      log(`EVENT:REGISTERED`, eventName);
      this.eventListeners.push({ eventName: eventName, handler: eventHandler });
    };

    /**
     * Triggers an event, that will invoke all listeners
     * @param {String} eventName
     * @param {any} arguments
     */
    this.emit = async function (eventName, ...params) {
      log('EVENT:EMITTING', eventName, ...params);
      return new Promise((resolve, reject) => {
        this.eventListeners
          .filter((ev) => ev.eventName == eventName)
          .forEach(async (l) => {
            await l.handler(...params);
          });

        resolve(true);
      });
    };

    return this;
  }
}
