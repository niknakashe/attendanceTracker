var sql = require("../../src/config/db.js");

const Attendance = function () {};

Attendance.prototype.insertAttendanceRequest = async function (data, callback) {
  let selectQuery = "SELECT * FROM attendanceRequest WHERE 1";

  for (key in data) {
    switch (key) {
      case "status":
        selectQuery += " AND status = " + data[key];
        break;
      case "userId":
        selectQuery += " AND userId = " + data[key];
        break;
      case "date":
        selectQuery += " AND date = '" + data[key] + "'";
        break;
      case "attendanceStatus":
        selectQuery += " AND attendanceStatus = " + data[key];
        break;
    }
  }

  sql.query(selectQuery, function (err, rows, fileds) {
    if (err) {
      callback({ status: false, msg: err });
      return;
    }
    if (rows.length > 0) {
      callback({ status: false, msg: "Already have request" });
    } else {
      let insertData = {
        userId: data.userId,
        date: data.date,
        attendanceStatus: data.attendanceStatus,
        status: data.status,
        task: data.task,
        additionalNotes: data.additionalNotes,
      };

      sql.query(
        "INSERT INTO attendanceRequest SET ?",
        insertData,
        function (error, results, fields) {
          if (error) {
            callback({ status: false, msg: "Something went wrong" });
          } else {
            callback({ status: true, data: results });
          }
        }
      );
    }
  });
};

Attendance.prototype.updateAttendanceRequest = async function (data, callback) {
  let updateQuery = "UPDATE attendanceRequest SET ";
  let updateQueryStack = [];

  for (key in data) {
    switch (key) {
      case "status":
        updateQueryStack.push(key + "='" + data[key] + "'");
        break;
    }
  }

  if (updateQueryStack.length > 0) {
    updateQuery += updateQueryStack.join(",") + " WHERE 1";
    for (key in data) {
      switch (key) {
        case "userId":
          updateQuery += " AND userId = " + data[key];
          break;
        case "requestId":
          updateQuery += " AND id = " + data[key];
          break;
      }
    }

    sql.query(updateQuery, function (err, result) {
      if (err) {
        callback({ status: false, msg: "Something went wrong" });
        return;
      } else {
        //if request is approved 1. Approved 2. Rejected
        if (data.status == 1) {
          let selectQuery = "SELECT * FROM attendanceRequest WHERE 1";
          for (key in data) {
            switch (key) {
              case "userId":
                selectQuery += " AND userId = " + data[key];
                break;
              case "requestId":
                selectQuery += " AND id = " + data[key];
                break;
            }
          }
          console.log("selectQuery", selectQuery);
          sql.query(selectQuery, function (err, rows, fileds) {
            if (err) {
              callback({ status: false, msg: err });
              return;
            }
            if (rows.length > 0) {
              let record = rows[0];
              let userAttendance = {
                status: record.attendanceStatus,
                attendanceDate: record.date,
                userId: record.userId,
                taskForDay: record.task,
                additionalNote: record.additionalNote,
              };

              sql.query(
                "INSERT INTO userAttendance SET ?",
                userAttendance,
                function (error, results, fields) {
                  if (error) {
                    callback({ status: false, msg: error });
                  } else {
                    callback({ status: true, data: results });
                  }
                }
              );
            } else {
              callback({ status: false, msg: "Something went wrong" });
              return;
            }
          });
        } else {
          callback({
            status: true,
            data: result.affectedRows + " records updated",
          });
          return;
        }
      }
    });
  } else {
    callback({ status: false, msg: "No Data to update" });
    return;
  }
};

Attendance.prototype.getAttendanceRequest = async function (data, callback) {
  let query = `SELECT
                    ar.*,
                    ud.email,
                    ud.name,
                    s.statusName
                FROM
                    attendanceRequest ar
                LEFT JOIN userDetails ud ON
                    ud.id = ar.userId
                LEFT JOIN status s ON 
                    s.id = ar.attendanceStatus
                WHERE
                    1`;

  for (key in data) {
    switch (key) {
      case "status":
        query += " AND ar.status IN (" + data[key] + ")";
        break;
      case "dateBetween":
        let dateArray = data[key].split("|");
        query +=
          " AND ar.date BETWEEN '" +
          dateArray[0] +
          "' AND '" +
          dateArray[1] +
          "'";
        break;
    }
  }

  sql.query(query, function (err, rows, fields) {
    if (err) {
      callback({ status: false, msg: err });
      return;
    } else {
      callback({ status: true, data: rows });
    }
  });
};

module.exports = new Attendance();
