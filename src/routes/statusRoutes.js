const express = require("express");
const statusRouter = express.Router();
const statusController = require("../controller/status");

statusRouter.get("/getStatus", function (req, res) {
  statusController.getStatus(req.body, function (resp) {
    res.json(resp);
  });
});

module.exports = statusRouter;
