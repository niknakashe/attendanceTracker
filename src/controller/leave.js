var LeaveModel = require("../models/leave");
const { Validator } = require("node-input-validator");

const Leave = function () {};

Leave.prototype.getUserLeaves = async function (data, callback) {
  LeaveModel.getUserLeaves(data, function (response) {
    callback(response);
  });
};

Leave.prototype.insertLeaveDetails = async function (data, callback) {
  const validate = new Validator(data, {
    leaveType: "required",
    userId: "required",
    startDate: "required",
    endDate: "required",
    transactionType: "required",
    noOfDays: "required",
  });

  const validated = await validate.check();

  if (!validated) {
    callback({ status: false, error: validate.errors });
  } else {
    LeaveModel.insertLeaveDetails(data, function (response) {
      callback(response);
    });
  }
};

Leave.prototype.getUserLeaveHistory = async function (data, callback) {
  LeaveModel.getUserLeaveHistory(data, function (response) {
    callback(response);
  });
};

module.exports = new Leave();
