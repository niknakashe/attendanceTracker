var sql = require("../../src/config/db.js");
var dateFormat = require("dateformat");

const Leave = function () {};

Leave.prototype.getUserLeaves = async function (data, callback) {
  let query =
    "SELECT plBalance, chBalance FROM userDetails WHERE id = " + data.userId;

  sql.query(query, function (err, rows, fields) {
    if (err) {
      callback({ status: false, msg: err });
    }
    callback({ status: true, data: rows });
  });
};

Leave.prototype.insertLeaveDetails = async function (data, callback) {
  let insertData = {
    userId: data.userId,
    leaveType: data.leaveType,
    startDate: data.startDate,
    endDate: data.endDate,
    noOfDays: data.noOfDays,
    transactionType: data.transactionType,
    comment: data.comment,
  };

  let query =
    "SELECT plBalance, chBalance FROM userDetails WHERE id = " + data.userId;

  sql.query(query, function (err, rows, fields) {
    if (err) {
      callback({ status: false, msg: err });
      return;
    } else if (rows.length == 0) {
      callback({ status: false, msg: "User details not found" });
      return;
    } else {
      let daysBetween = getDaysArray(
        new Date(data.startDate),
        new Date(data.endDate)
      );
      let attendanceCheckSql =
        "SELECT * FROM `userAttendance` WHERE attendanceDate IN (";
      daysBetween.map(function (value, index) {
        attendanceCheckSql += "'" + dateFormat(value, "yyyy-mm-dd") + "'";
        if (index !== daysBetween.length - 1) {
          attendanceCheckSql += ",";
        }
      });
      attendanceCheckSql += ") AND userId = " + data.userId;
      console.log("query", attendanceCheckSql);

      sql.query(attendanceCheckSql, function (err, attendanceEntry, fields) {
        if (err) {
          callback({ status: false, error: err });
        } else if (attendanceEntry.length > 0) {
          callback({ status: false, msg: "Already got entry for date" });
          return;
        } else {
          let leaveBalance = rows[0];

          if (
            (data.leaveType == 1 && leaveBalance.plBalance < data.noOfDays) ||
            (data.leaveType == 2 && leaveBalance.chBalance < data.noOfDays)
          ) {
            callback({ status: false, msg: "Insufficient leaves" });
            return;
          }

          sql.query(
            "INSERT INTO leaveHistory SET ?",
            insertData,
            function (error, results, fields) {
              if (error) {
                return sql.rollback(function () {
                  callback({ status: false, error: error });
                  return;
                });
              }

              let status = data.leaveType == 1 ? "5" : "7";
              let insertObject = {};

              daysBetween.map(function (value, index) {
                insertObject = {
                  attendanceDate: value,
                  userId: data.userId,
                  status: status,
                  taskForDay: "On Leave",
                };
                sql.query(
                  "INSERT INTO userAttendance SET ?",
                  insertObject,
                  function (error, results, fields) {
                    if (error) {
                      return sql.rollback(function () {
                        callback({ status: false, error: error });
                        return;
                      });
                    }
                  }
                );
              });

              let updateQuery = "UPDATE userDetails SET ";
              let remainingBal =
                data.leaveType == 1
                  ? leaveBalance.plBalance - data.noOfDays
                  : leaveBalance.chBalance - data.noOfDays;

              if (data.leaveType == 1) {
                updateQuery += " plBalance = ? ";
              } else if (data.leaveType == 2) {
                updateQuery += " chBalance = ? ";
              }

              updateQuery += " WHERE id = ?";
              console.log("updateQuery", updateQuery);
              sql.query(
                updateQuery,
                [remainingBal, data.userId],
                function (error, results, fields) {
                  if (error) {
                    return sql.rollback(function () {
                      callback({ status: false, error: error });
                      return;
                    });
                  }
                }
              );

              callback({ status: true, msg: "Updated Sucessfully" });
            }
          );
        }
      });
    }
  });
};

Leave.prototype.getUserLeaveHistory = async function (data, callback) {
  let query = "SELECT * FROM leaveHistory WHERE 1";

  for (key in data) {
    switch (key) {
      case "userId":
        query += " AND userId = " + data[key];
        break;
      case "dateBetween":
        let dates = data[key].split("|");
        query +=
          " AND startDate BETWEEN '" + dates[0] + "' AND '" + dates[1] + "'";
        break;
    }
  }

  sql.query(query, function (err, rows, fields) {
    if (err) {
      callback({ status: false, msg: err });
      return;
    }
    callback({ status: true, data: rows });
  });
};

var getDaysArray = function (start, end) {
  for (var arr = [], dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr;
};

module.exports = new Leave();
