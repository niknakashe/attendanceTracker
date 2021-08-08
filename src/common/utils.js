const config = require("../config/config");
const _ = require("underscore");
const mongoose = require("mongoose");
const mObjectId = mongoose.Types.ObjectId;
const Utils = function () {};

/** SOC Checks Phone No. is Valid Or Not */
Utils.prototype.isValidPhoneNumber = function (number) {
  return number.toString() && /^[-+]?\d*\.?\d*$/.test(number);
};

/**EOC */

/**SOC : Add any no. to  date and time*/
Utils.prototype.addDate = function (date, interval, units) {
  var ret = new Date(date); //don't change original date
  var checkRollover = function () {
    if (ret.getDate() != date.getDate()) ret.setDate(0);
  };
  switch (interval.toLowerCase()) {
    case "year":
      ret.setFullYear(ret.getFullYear() + units);
      checkRollover();
      break;
    case "quarter":
      ret.setMonth(ret.getMonth() + 3 * units);
      checkRollover();
      break;
    case "month":
      ret.setMonth(ret.getMonth() + units);
      checkRollover();
      break;
    case "week":
      ret.setDate(ret.getDate() + 7 * units);
      break;
    case "day":
      ret.setDate(ret.getDate() + units);
      break;
    case "hour":
      ret.setTime(ret.getTime() + units * 3600000);
      break;
    case "minute":
      ret.setTime(ret.getTime() + units * 60000);
      break;
    case "second":
      ret.setTime(ret.getTime() + units * 1000);
      break;
    default:
      ret = undefined;
      break;
  }
  return ret;
};
/**EOC */

Utils.prototype.getFormatDate = function (date, format) {
  let d = new Date(date);
  let year = d.getFullYear();
  let month = d.getMonth();
  let day = d.getDate();
  //  let oneDayAfter : Date ;
  let dateFormat = "";
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  if (format == "dd/mm/yyyy") {
    dateFormat = `${day}/${month + 1}/${year}`;
    return dateFormat;
  }
  // if(format == 'oneDayAfter'){
  //   return oneDayAfter = new Date(day + 1, month+1, year)
  // }
  if (format == "dd-mm-yyyy") {
    dateFormat = `${day}-${month + 1}-${year}`;
    return dateFormat;
  }
  if (format == "ddmmmyyyy") {
    dateFormat = `${day} ${months[month]} ${year}`;
    return dateFormat;
  }
  if (format == "ddmmmmyyyy") {
    dateFormat = `${day} ${monthNames[month]} ${year}`;
    return dateFormat;
  }
};

/** SOC : Getting Custom date and its month , year and date  */
Utils.prototype.getCustomDate = function (action) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth();
  let day = d.getDate();
  let c = new Date(year + 1, month, day);
  if (action === "year") {
    return year;
  }
  if (action === "month") {
    return monthNames[month];
  }
  if (action === "oneYearDate") {
    return c;
  }
};
/**EOC */

/** SOC : Validating Password length*/
Utils.prototype.isValidPassword = function (pwd) {
  return _.isString(pwd) && pwd.length >= config.passwordLength;
};
/**EOC */

/** SOC : Validating Email  */
Utils.prototype.isValidEmail = function (email) {
  return (
    email &&
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(
      email
    )
  );
};
/**EOC */

/** SOC : Validating Mongo ObjectId   */
Utils.prototype.isValidObjectId = function (id) {
  return id && mObjectId.isValid(id);
};
/**EOC */

/** SOC : Checks object is empty or not */
Utils.prototype.isEmpty = function (obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
};
/**EOC */

module.exports = new Utils();
