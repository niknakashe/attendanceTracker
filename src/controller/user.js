var userModel = require("../models/user");
const { Validator } = require("node-input-validator");

const UserDetails = function () {};

UserDetails.prototype.isUserExist = async function (data, callback) {
  userModel.isUserExist(data, function (response) {
    callback(response);
  });
};

UserDetails.prototype.insertUserDetails = async function (data, callback) {
  //Check If User Already exist
  await userModel.isUserExist(data, function (resposne) {
    let userDetails = resposne;

    if (userDetails.length > 0) {
      callback({ status: false, msg: "User already present" });
    } else {
      userModel.insertUserDetails(data, function (response) {
        callback({ status: true, data: response });
      });
    }
  });
};

UserDetails.prototype.insertUserStatus = async function (data, callback) {
  const validate = new Validator(data, {
    userId: "required",
    attendanceDate: "required",
    taskForDay: "required",
    status: "required",
  });

  const validated = await validate.check();

  if (!validated) {
    callback({ status: false, error: validate.errors });
  } else {
    userModel.insertUserStatus(data, function (response) {
      callback(response);
    });
  }
};

UserDetails.prototype.getUserAttendance = async function (data, callback) {
  userModel.getUserAttendance(data, function (response) {
    callback(response);
  });
};

UserDetails.prototype.updateUserDetails = async function (data, callback) {
  userModel.updateUserDetails(data, function (response) {
    callback(response);
  });
};

UserDetails.prototype.getUserAttendanceCalender = async function (
  data,
  callback
) {
  const validate = new Validator(data, {
    userId: "required",
  });

  const validated = await validate.check();

  if (!validated) {
    callback({ status: false, error: validate.errors });
  } else {
    userModel.getUserAttendanceCalender(data, function (response) {
      callback(response);
    });
  }
};

UserDetails.prototype.getUserAttendanceReport = async function (
  data,
  callback
) {
  const validate = new Validator(data, {
    dateBetween: "required",
  });

  const validated = await validate.check();

  if (!validated) {
    callback({ status: false, error: validate.errors });
  } else {
    userModel.getUserAttendanceReport(data, function (response) {
      callback(response);
    });
  }
};

module.exports = new UserDetails();
