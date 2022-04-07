import { log } from "./log.js";
export class Destiny2Database {
  constructor() {
    this.DBInstance = null;

    this.initializeDatabase = async function () {
      return new Promise((resolve, reject) => {
        let dbRequest = window.indexedDB.open("destiny2", 2);

        dbRequest.onupgradeneeded = function (event) {
          const db = dbRequest.result;
          const upgradeTransaction = event.target.transaction;

          log("DB", "Old", event.oldVersion, "New", event.newVersion);
          if (event.oldVersion < 1) {
            log("DB", "Creating first version of database, since it never existed on this installation.");
            const keyValueStore = db.createObjectStore("storage", {
              autoIncrement: false,
              keyPath: "key",
            });

            keyValueStore.createIndex("by_key", "key");
          }
          if (event.oldVersion < 2) {
            log("DB", "Creating object store for player/character activity");

            const playerActivityStore = db.createObjectStore("playerActivity", {
              autoIncrement: false,
              keyPath: "key",
            });

            playerActivityStore.createIndex("by_key", "key");

            const activityDetailsStore = db.createObjectStore("activityDetails", {
              autoIncrement: false,
              keyPath: "key",
            });

            activityDetailsStore.createIndex("by_key", "key");
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

    async function _setItem(storeName, key, value) {
      return new Promise((resolve, reject) => {
        const transaction = self.DBInstance.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.put({
          key: key,
          value: value,
        });

        request.onsuccess = function () {
          resolve();
        };

        request.onerror = function (event) {
          reject(event);
        };
      });
    }

    async function _getFilteredItems(storeName, filter = null) {
      return new Promise((resolve, reject) => {
        const transaction = self.DBInstance.transaction(storeName, "readonly");
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();

        request.onsuccess = function () {
          const result = request.result;

          if (filter) {
            resolve(result.filter(filter));
          } else {
            resolve(result);
          }
        };

        request.onerror = function (event) {
          reject(event);
        };
      });
    }

    async function _getItem(storeName, key, defaultValue = null) {
      return new Promise((resolve, reject) => {
        const transaction = self.DBInstance.transaction(storeName, "readonly");
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.get(key);

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
    }

    async function _removeItem(storeName, key) {
      return new Promise((resolve, reject) => {
        const transaction = self.DBInstance.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.delete(key);

        request.onsuccess = function () {
          resolve();
        };

        request.onerror = function (event) {
          reject(event);
        };
      });
    }

    this.setItem = async function (key, value) {
      return await _setItem("storage", key, value);
    };

    this.getItem = async function (key, defaultValue = null) {
      return await _getItem("storage", key, defaultValue);
    };

    this.removeItem = async function (key) {
      return await _removeItem("storage", key);
    };

    this.setStorageItem = async function (storageName, key, value) {
      return await _setItem(storageName, key, value);
    };

    this.getStorageItem = async function (storageName, key, defaultValue = null) {
      return await _getItem(storageName, key, defaultValue);
    };

    this.getStorageItems = async function (storageName, filter = null) {
      return await _getFilteredItems(storageName, filter);
    };

    this.removeStorageItem = async function (storageName, key) {
      return await _removeItem(storageName, key);
    };

    var self = this;

    return this;
  }
}
