const express = require("express");
const attendanceRouter = express.Router();
const attendanceController = require("../controller/attendance");

attendanceRouter.post("/insertAttendanceRequest", function (req, res) {
  attendanceController.insertAttendanceRequest(req.body, function (resp) {
    res.json(resp);
  });
});

attendanceRouter.post("/updateAttendanceRequest", function (req, res) {
  attendanceController.updateAttendanceRequest(req.body, function (resp) {
    res.json(resp);
  });
});

attendanceRouter.get("/getAttendanceRequest", function (req, res) {
  attendanceController.getAttendanceRequest(req.query, function (resp) {
    res.json(resp);
  });
});

attendanceRouter.get("/sendAttendanceMailToCustomer", function (req, res) {
  attendanceController.sendAttendanceMailToCustomer(req.query, function (resp) {
    res.json(resp);
  });
});

module.exports = attendanceRouter;
