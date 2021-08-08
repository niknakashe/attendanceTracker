"use strict";

import "../plugins/waitMe.js";
import "../plugins/waitMe.min.css";

export default {
  constructor() {},

  unique(xs) {
    return xs.filter(function (x, i) {
      return xs.indexOf(x) === i;
    });
  },

  diffArray(arr1, arr2) {
    var newArr = [];

    arr1.map(function (val) {
      arr2.indexOf(val) < 0 ? newArr.push(val) : "";
    });

    arr2.map(function (val) {
      arr1.indexOf(val) < 0 ? newArr.push(val) : "";
    });

    return newArr;
  },

  myGet(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    /*return decodeURIComponent(results[2].replace(/\+/g, " "));*/
    return decodeURIComponent(results[2]);
  },

  userValidation(post) {
    var mandaField = 0;
    var data = {};
    for (let key in post) {
      let value = post[key];
      if (value != "") {
        switch (key) {
          case "userName":
            data[key] = value;
            mandaField++;
            break;

          case "userMobileNo":
            data[key] = value;
            if (post["countryCode"] == "+91") {
              if (typeof value != "undefined" && value.length == 10) {
                mandaField++;
              }
            } else {
              mandaField++;
            }
            break;

          case "userEmail":
            data[key] = value;
            mandaField++;
            break;
        }
      }
    }

    if (mandaField != 3) {
      data = {};
      data["error"] = "1";
      data["errorMsg"] = "User Details Not Provided";
    }

    return data;
  },

  inArray(needle, stack = []) {
    var ret = false;
    if (typeof needle != "undefined") {
      var i = stack.indexOf(needle);
      if (i > -1) {
        ret = true;
      }
    }

    return ret;
  },

  formatDateToSql(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  },

  formatDate: function (date) {
    var month = new Array();
    month[0] = "01";
    month[1] = "02";
    month[2] = "03";
    month[3] = "04";
    month[4] = "05";
    month[5] = "06";
    month[6] = "07";
    month[7] = "08";
    month[8] = "09";
    month[9] = "10";
    month[10] = "11";
    month[11] = "12";
    //var n = month[d.getMonth()];
    let formatedDate = date.getFullYear();
    formatedDate = formatedDate + "-" + month[date.getMonth()];
    formatedDate = formatedDate + "-" + ("0" + date.getDate()).slice(-2);
    return formatedDate;
  },

  dateFormat: function (str) {
    var m_names = [
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

    var d = new Date(str);
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();

    var result = curr_date + " " + m_names[curr_month] + " " + curr_year;
    if (result == "1 Jan 1970") {
      result = "";
    }

    return result;
  },

  priceFormat(no) {
    if (no == null || typeof no === "undefined" || no == "") {
      no = 0;
    }
    var _number = no.toString();
    if (_number > 0) {
      var _sep = ",";
      _number = typeof _number != "undefined" && _number > 0 ? _number : "";
      _number = _number
        .replace(
          new RegExp(
            "^(\\d{" +
              (_number.length % 3 ? _number.length % 3 : 0) +
              "})(\\d{3})",
            "g"
          ),
          "$1 $2"
        )
        .replace(/(\d{3})+?/gi, "$1 ")
        .trim();
      if (typeof _sep != "undefined" && _sep != " ") {
        _number = _number.replace(/\s/g, _sep);
      }
    }
    return _number;
  },

  isArray(obj) {
    var ret = false;
    if (obj.constructor === Array && obj.length > 0) {
      ret = true;
    }
    return ret;
  },

  requiredFieldValidation(
    params,
    errorMsgLog,
    inputNames,
    inputIndex,
    REQUIRED_ERROR
  ) {
    if (
      typeof params[inputNames[inputIndex]] != "undefined" &&
      params[inputNames[inputIndex]] != ""
    ) {
      if (typeof errorMsgLog[inputNames[inputIndex]] != "undefined") {
        if (
          errorMsgLog[inputNames[inputIndex]] == REQUIRED_ERROR ||
          errorMsgLog[inputNames[inputIndex]] == ""
        ) {
          delete errorMsgLog[inputNames[inputIndex]];
        }
      }
    } else {
      if (typeof errorMsgLog[inputNames[inputIndex]] == "undefined") {
        errorMsgLog[inputNames[inputIndex]] = REQUIRED_ERROR;
      }
    }

    return errorMsgLog;
  },

  safeReturn(array, index, defaultValue, checkFor) {
    defaultValue = typeof defaultValue == "undefined" ? false : defaultValue;
    if (
      typeof array == "undefined" ||
      typeof index == "undefined" ||
      array == null ||
      index == null
    ) {
      return defaultValue;
    }
    if (!(index in array)) {
      return defaultValue;
    }
    if (this.inArray(null, checkFor) && array[index] == null) {
      return defaultValue;
    }
    if (this.inArray("", checkFor) && array[index] === "") {
      return defaultValue;
    }
    if (this.inArray("0", checkFor) && array[index] == "0") {
      return defaultValue;
    }
    return array[index];
  },

  formatAMPM(date1) {
    var date = new Date(date1);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  },

  convertToAmount(yourNumber) {
    //Seperates the components of the number
    var components = yourNumber.toString().split(".");
    //Comma-fies the first part
    components[0] = components[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    //Combines the two sections
    return components.join(".");
  },

  validateEmail(email) {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },

  offset(el) {
    var rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      viewPortTop: rect.top,
    };
  },

  setValueIfNotDefined: function (variable, value) {
    if (typeof variable == "undefined") {
      variable = value;
      return variable;
    }
    return variable;
  },

  isStringSet: function (value, defaultReturnValue) {
    defaultReturnValue =
      typeof defaultReturnValue == "undefined" ? false : defaultReturnValue;
    var result = defaultReturnValue;
    if (
      (this.setValueIfNotDefined(value, false) != false &&
        value != "" &&
        value != null) ||
      value == 0
    ) {
      result = value;
    }
    return result;
  },

  startLoading: function (selector, loadEffect, loadText, width, height) {
    if (!navigator.onLine) {
      alert("You Are Not Connected to Internet");
      return;
    }
    loadEffect = this.setValueIfNotDefined(loadEffect, "bounce");
    loadText = this.setValueIfNotDefined(loadText, "Please wait...");
    width = this.setValueIfNotDefined(width, "");
    height = this.setValueIfNotDefined(height, "");
    if (typeof $.fn.waitMe === "undefined") {
      console.log("WaitMe js not loaded");
      return;
    }
    $(selector).waitMe({
      effect: loadEffect,
      text: loadText,
      bg: "rgba(255,255,255,0.7)",
      color: "#000",
      sizeW: width,
      sizeH: height,
      source: "img.svg",
      onClose: function () {},
    });
    //more effect at http://vadimsva.github.io/waitMe/
  },

  stopLoading: function (selector) {
    if (typeof $.fn.waitMe === "undefined") {
      console.log("WaitMe js not loaded");
      return;
    }
    $(selector).waitMe("hide");
  },

  trim: function (s, mask) {
    // console.log(s !== '', s);
    if (s !== "") {
      while (~mask.indexOf(s[0])) {
        s = s.slice(1);
      }
      while (~mask.indexOf(s[s.length - 1])) {
        s = s.slice(0, -1);
      }
    } else {
      return s;
    }
    return s;
  },

  checkAuthToken: function (response, location) {
    // Check Api response if Authtoken error Redirect to logout
    location = location + "restaurantadmin/common/logout"; // location Arg is base path
    if (
      response.hasOwnProperty("error") &&
      response.error.hasOwnProperty("message") &&
      response.error.message === "Invalid Auth Token."
    ) {
      window.location = location;
    }
  },

  roundUp: function (to, x) {
    x = parseInt(x);
    return Math.ceil(x / to) * to;
  },

  objectShallowCopy: function (o) {
    var copy = Object.create(o);
    for (let prop in o) {
      if (o.hasOwnProperty(prop)) {
        copy[prop] = o[prop];
      }
    }
    return copy;
  },
};
