import { log } from "./log.js";
export class Destiny2Database {
  constructor() {
    this.DBInstance = null;

    this.initializeDatabase = async function () {
      return new Promise((resolve, reject) => {
        let dbRequest = window.indexedDB.open("destiny2", 1);

        dbRequest.onupgradeneeded = function (event) {
          const db = dbRequest.result;
          const upgradeTransaction = event.target.transaction;

          log("DB", "Old", event.oldVersion, "New", event.newVersion);
          if (event.oldVersion < 1) {
            log(
              "DB",
              "Creating first version of database, since it never existed on this installation."
            );
            const keyValueStore = db.createObjectStore("storage", {
              autoIncrement: false,
              keyPath: "key",
            });

            keyValueStore.createIndex("by_key", "key");
          }
        };

        dbRequest.onsuccess = function () {
          log("DB", "Loaded database");
          window.db.DBInstance = dbRequest.result;

          resolve();
        };

        dbRequest.onerror = function (event) {
          log("DB", "Failed to load database");
          reject(event);
        };
      });
    };

    this.setItem = async function (key, value) {
      return new Promise((resolve, reject) => {
        let request = self.DBInstance.transaction("storage", "readwrite")
          .objectStore("storage")
          .put({
            key: key,
            value: value,
          });

        request.onsuccess = function () {
          resolve();
        };

        request.onerror = function () {
          reject();
        };
      });
    };

    this.getItem = async function (key, defaultValue = null) {
      return new Promise((resolve, reject) => {
        let request = self.DBInstance.transaction("storage", "readonly")
          .objectStore("storage")
          .get(key);

        request.onsuccess = function (event) {
          if (event.target.result) {
            resolve(event.target.result.value);
          } else {
            resolve(defaultValue);
          }
        };

        request.onerror = function (event) {
          reject(event);
        };
      });
    };

    this.removeItem = async function (key) {
      return new Promise((resolve, reject) => {
        let request = self.DBInstance.transaction("storage", "readwrite")
          .objectStore("storage")
          .delete(key);

        request.onsuccess = function () {
          resolve();
        };

        request.onerror = function () {
          reject();
        };
      });
    };

    var self = this;

    return this;
  }
}
