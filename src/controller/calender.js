var calenderModel = require("../models/calender");

const Calender = function () {};

Calender.prototype.getHolidayList = async function (data, callback) {
  calenderModel.getHolidayList(data, function (response) {
    callback(response);
  });
};

module.exports = new Calender();
