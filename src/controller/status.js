var statusModel = require("../models/status");

const Status = function () {};

Status.prototype.getStatus = async function (data, callback) {
  statusModel.getStatus(data, function (response) {
    callback(response);
  });
};

module.exports = new Status();
