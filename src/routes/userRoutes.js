const express = require("express");
const userRouter = express.Router();
const userController = require("../controller/user");

userRouter.post("/isUserExist", function (req, res) {
  userController.isUserExist(req.body, function (resp) {
    res.json(resp);
  });
});

userRouter.post("/insertUserDetails", function (req, res) {
  userController.insertUserDetails(req.body, function (resp) {
    res.json(resp);
  });
});

userRouter.post("/insertUserStatus", function (req, res) {
  userController.insertUserStatus(req.body, function (resp) {
    res.json(resp);
  });
});

userRouter.post("/getUserAttendance", function (req, res) {
  userController.getUserAttendance(req.body, function (resp) {
    res.json(resp);
  });
});

userRouter.post("/updateUserDetails", function (req, res) {
  userController.updateUserDetails(req.body, function (resp) {
    res.json(resp);
  });
});

userRouter.post("/getUserAttendanceCalender", function (req, res) {
  userController.getUserAttendanceCalender(req.body, function (resp) {
    res.json(resp);
  });
});

userRouter.get("/getUserAttendanceReport", function (req, res) {
  userController.getUserAttendanceReport(req.query, function (resp) {
    res.json(resp);
  });
});

module.exports = userRouter;
