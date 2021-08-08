/**
 *
 * @param {Number} timestamp
 */
function NDate(timestamp) {
  this.timestamp = timestamp;
  this.date = new Date(timestamp);
  /**
   *
   * @param {Number} days Use an integer, will floor it
   */
  this.addDay = function (days) {
    if (isNaN(days)) {
      throw new Error('Parameter "days" is not a number.');
    }

    this.timestamp = this.timestamp + Math.floor(days) * 86400000;

    this.updateDate();

    return this;
  };

  this.updateDate = function updateDate() {
    this.date = new Date(this.timestamp);
  };

  this.removeTime = function () {
    let x = new Date(this.timestamp);
    x.setHours(0, 0, 0, 0);
    this.timestamp = x.getTime();

    this.updateDate();

    return this;
  };

  return this;
}

function GetUTCDate() {
  let d = new Date();
  d.setTime(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
  return d;
}
