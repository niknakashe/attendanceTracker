const express = require("express");
const leaveRouter = express.Router();
const leaveController = require("../controller/leave");

leaveRouter.get("/getUserLeaves", function (req, res) {
  leaveController.getUserLeaves(req.query, function (resp) {
    res.json(resp);
  });
});

leaveRouter.post("/insertLeaveDetails", function (req, res) {
  leaveController.insertLeaveDetails(req.body, function (resp) {
    res.json(resp);
  });
});

leaveRouter.get("/getUserLeaveHistory", function (req, res) {
  leaveController.getUserLeaveHistory(req.query, function (resp) {
    res.json(resp);
  });
});

module.exports = leaveRouter;
