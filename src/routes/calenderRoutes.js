const express = require("express");
const calenderRoute = express.Router();
const calenderController = require("../controller/calender");

calenderRoute.get("/getHolidayList", function (req, res) {
  calenderController.getHolidayList(req.query, function (resp) {
    res.json(resp);
  });
});

module.exports = calenderRoute;
