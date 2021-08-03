/**
 * Shortens the text if it's longer than the max length
 * @param {string} string
 * @param {number} maxLength
 * @returns {string}
 */
function shorten(string, maxLength) {
  if (string.length > maxLength) {
    return string.substring(0, maxLength).trim() + " ...";
  }

  return string;
}

/**
 * Sorts a the dictionary you send, based on the property (numbers)
 * @param {Object} dictionary
 * @param {String} property The property in the dictionary to sort on
 * @param {Boolean} ascending Sort ascending or descending (Default descending)
 */
function sortDictionaryByProperty(dictionary, property, ascending) {
  let items = Object.keys(dictionary).map(function (key) {
    return [key, dictionary[key]];
  });

  items.sort(function (first, second) {
    if (ascending) return first[1][property] - second[1][property];
    return second[1][property] - first[1][property];
  });

  return items;
}

function sortDictionaryByPropertyAlphabetically(
  dictionary,
  property,
  ascending
) {
  let internal = sortDictionaryByProperty(dictionary, property, ascending);

  var keys = internal.map((v) => v[0]).sort();

  let newItems = [];
  for (let key of keys) {
    newItems.push([key, internal.filter((v) => v[0] == key)[0][1]]);
  }

  return newItems;
}

/**
 * Outputs a date in YYYY-MM-DD format
 * @param {Date} date
 */
function formatDate(date) {
  let retVal = "";

  retVal += date.getFullYear() + "-";
  if (date.getMonth() + 1 < 10) {
    retVal += "0";
  }
  retVal += date.getMonth() + 1 + "-";

  if (date.getDate() < 10) {
    retVal += "0";
  }
  retVal += date.getDate();

  return retVal;
}

/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {Boolean} latestSession
 * @returns {String}
 */
function formatTimespan(startDate, endDate, latestSession) {
  if (!latestSession && !endDate) return `Unknown, no end time`;
  return outputTimesObjectFromDifference(getTimeDifference(startDate, endDate));
}

/**
 *
 * @param {Number} days
 * @param {Number} hours
 * @param {Number} minutes
 * @param {Number} seconds
 * @returns {String}
 */
function outputTimesObject(days, hours, minutes, seconds) {
  return `${days > 0 ? days + "d, " : ""}${hours > 0 ? hours + "h, " : ""}${
    minutes > 0 ? minutes + "m, " : ""
  }${seconds + "s"}`;
}

function outputTimesObjectFromDifference(differenceInSeconds) {
  let { days, hours, minutes, seconds } = getTimeObject(differenceInSeconds);
  return outputTimesObject(days, hours, minutes, seconds);
}

/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Number}
 */
function getTimeDifference(startDate, endDate) {
  if (!endDate) endDate = Date.now();
  return (endDate - startDate) / 1000;
}

function getTimeObject(differenceInSeconds) {
  let days = Math.floor(differenceInSeconds / (24 * 3600));
  let hours = Math.floor((differenceInSeconds % (24 * 3600)) / 3600);
  let minutes = Math.floor((differenceInSeconds % 3600) / 60);
  let seconds = Math.floor(differenceInSeconds % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

/**
 *
 * @param {Number} count
 * @param {String} singular
 * @param {String} plural
 * @returns {String} pluralized string
 */
function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Method copied from Stackoverflow (https://stackoverflow.com/a/8809472/1025823)
 * @returns {string} Returns a UUIDv4
 */
function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 = (performance && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
