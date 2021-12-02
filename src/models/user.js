var sql = require("../../src/config/db.js");
const config = require("../config/config");
var leaveModel = require("../models/leave");
var dateFormat = require("dateformat");

const UserDetails = function () {};

UserDetails.prototype.isUserExist = async function (data, callback) {
  sql.query(
    "SELECT * FROM userDetails WHERE email LIKE ?",
    [data.email],
    function (err, rows, fields) {
      if (err) {
        callback({ status: false, msg: err });
      }
      callback(rows);
    }
  );
};

UserDetails.prototype.insertUserDetails = async function (data, callback) {
  let userDetails = {
    email: data.email,
    userType: typeof data.userType !== "undefined" ? data.userType : 2,
    ifActive: typeof data.ifActive !== "undefined" ? data.ifActive : 1,
  };
  sql.query(
    "INSERT INTO userDetails SET ?",
    userDetails,
    function (error, results, fields) {
      if (error) {
        callback({ status: false, msg: "Something went wrong" });
      } else {
        callback({ status: true, data: results });
      }
    }
  );
};

UserDetails.prototype.insertUserStatus = async function (data, callback) {
  let userStatus = {
    status: data.status,
    attendanceDate: data.attendanceDate,
    userId: data.userId,
    taskForDay: data.taskForDay,
    additionalNote:
      typeof data.additionalNote !== "undefined" ? data.additionalNote : null,
    missedReason:
      typeof data.missedReason !== "undefined" ? data.missedReason : null,
  };

  if (
    data.status == config.PAID_LEAVE ||
    data.status == config.CHOICE_HOLIDAY
  ) {
    let insertLeaveDetailsData = {
      userId: data.userId,
      leaveType: data.status == config.PAID_LEAVE ? 1 : 2,
      noOfDays: 1,
      transactionType: 1,
      comment: data.taskForDay,
      startDate: data.attendanceDate,
      endDate: data.attendanceDate,
    };
    if (data.status == config.PAID_LEAVE) {
      leaveModel.insertLeaveDetails(
        insertLeaveDetailsData,
        function (response) {
          callback(response);
        }
      );
    } else if (data.status == config.CHOICE_HOLIDAY) {
      sql.query(
        "SELECT * FROM holidayCalender WHERE ifActive = 1 AND type = 2 AND date = '" +
          dateFormat(data.attendanceDate, config.API_DATE_FORMAT) +
          "'",
        function (error, rows, fields) {
          if (error) {
            callback({ status: false, msg: "Something went wrong" });
          } else if (rows.length == 0) {
            callback({
              status: false,
              msg: "Choice Holiday can not be apply for this date",
            });
          } else if (rows.length > 0) {
            leaveModel.insertLeaveDetails(
              insertLeaveDetailsData,
              function (response) {
                callback(response);
              }
            );
          } else {
            callback({ status: false, msg: "Something went wrong" });
          }
        }
      );
    }
  } else {
    sql.query(
      "INSERT INTO userAttendance SET ?",
      userStatus,
      function (error, results, fields) {
        if (error) {
          callback({ status: false, msg: "Something went wrong" });
        } else {
          callback({ status: true, data: results });
        }
      }
    );
  }
};

UserDetails.prototype.getUserAttendance = async function (data, callback) {
  let query =
    "SELECT * FROM userAttendance ua LEFT JOIN status s ON s.id = ua.status LEFT JOIN userDetails ud ON ud.id = ua.userId WHERE 1";

  for (key in data) {
    switch (key) {
      case "attendanceDate":
        query += " AND ua." + key + " LIKE '" + data[key] + "'";
        break;
      case "userId":
        query += " AND ua." + key + " IN (" + data[key] + ")";
        break;
      case "dateBetween":
        let date = data[key].split("|");
        query +=
          " AND ua.attendanceDate BETWEEN '" +
          date[0] +
          "' AND '" +
          date[1] +
          "'";
        break;
    }
  }

  sql.query(query, function (err, rows, fileds) {
    if (err) {
      callback({ status: false, msg: err });
    } else {
      callback({ status: true, data: rows });
    }
  });
};

UserDetails.prototype.getNotPresentUser = async function (data) {
  let query =
    `SELECT
                    *
                FROM
                    userdetails ud
                WHERE
                    ud.id NOT IN(
                    SELECT
                        ua.userId
                    FROM
                        userattendance ua
                    WHERE
                        ua.attendanceDate = '` +
    data.attendanceDate +
    `'
                ) AND ud.ifActive = 1 AND ud.userType = 1`;  

  return new Promise((resolve, reject) => {
    sql.query(query, function (err, rows, fileds) {
      if (err) {
        reject({
          status: false,
          msg: err,
        });
      } else {
        resolve({
          status: true,
          data: rows,
        });
      }
    });
  });
};

UserDetails.prototype.getUserAttendanceCalender = async function (
  data,
  callback
) {
  let query =
    `SELECT
                    v.date as calenderDate,
                    (
                        CASE WHEN(
                            ua.status IS NOT NULL && ua.status != 6
                        ) OR(DAYOFWEEK(v.date) = 1) OR(DAYOFWEEK(v.date) = 7) OR(hc.holidayName IS NOT NULL) THEN 1 ELSE 0
                    END
                    ) AS markStatus,
                    ua.attendanceDate,
                    ua.userId,
                    ua.status,
                    ua.taskForDay,
                    ua.additionalNote,
                    s.statusName,
                    s.shortName,
                    s.statusColor,
                    s.ifActive,
                    hc.holidayName,
                    op.holidayName as optionalHolidayName
                    FROM
                        (
                        SELECT
                            ADDDATE(
                                '1970-01-01',
                                t4.i * 10000 + t3.i * 1000 + t2.i * 100 + t1.i * 10 + t0.i
                            ) AS DATE
                        FROM
                            (
                            SELECT
                                0 i
                            UNION
                        SELECT
                            1
                        UNION
                    SELECT
                        2
                    UNION
                    SELECT
                        3
                    UNION
                    SELECT
                        4
                    UNION
                    SELECT
                        5
                    UNION
                    SELECT
                        6
                    UNION
                    SELECT
                        7
                    UNION
                    SELECT
                        8
                    UNION
                    SELECT
                        9
                        ) t0,
                        (
                        SELECT
                            0 i
                        UNION
                    SELECT
                        1
                    UNION
                    SELECT
                        2
                    UNION
                    SELECT
                        3
                    UNION
                    SELECT
                        4
                    UNION
                    SELECT
                        5
                    UNION
                    SELECT
                        6
                    UNION
                    SELECT
                        7
                    UNION
                    SELECT
                        8
                    UNION
                    SELECT
                        9
                    ) t1,
                    (
                        SELECT
                            0 i
                        UNION
                    SELECT
                        1
                    UNION
                    SELECT
                        2
                    UNION
                    SELECT
                        3
                    UNION
                    SELECT
                        4
                    UNION
                    SELECT
                        5
                    UNION
                    SELECT
                        6
                    UNION
                    SELECT
                        7
                    UNION
                    SELECT
                        8
                    UNION
                    SELECT
                        9
                    ) t2,
                    (
                        SELECT
                            0 i
                        UNION
                    SELECT
                        1
                    UNION
                    SELECT
                        2
                    UNION
                    SELECT
                        3
                    UNION
                    SELECT
                        4
                    UNION
                    SELECT
                        5
                    UNION
                    SELECT
                        6
                    UNION
                    SELECT
                        7
                    UNION
                    SELECT
                        8
                    UNION
                    SELECT
                        9
                    ) t3,
                    (
                        SELECT
                            0 i
                        UNION
                    SELECT
                        1
                    UNION
                    SELECT
                        2
                    UNION
                    SELECT
                        3
                    UNION
                    SELECT
                        4
                    UNION
                    SELECT
                        5
                    UNION
                    SELECT
                        6
                    UNION
                    SELECT
                        7
                    UNION
                    SELECT
                        8
                    UNION
                    SELECT
                        9
                    ) t4
                    ) v
                    LEFT JOIN userAttendance ua ON
                        ua.attendanceDate = v.date AND ua.userId = ` +
    data.userId +
    `
                    LEFT JOIN status s ON
                        s.id = ua.status
                    LEFT JOIN holidayCalender hc ON
                        hc.date = v.date AND hc.type = 1
                    LEFT JOIN holidayCalender op ON
                        op.date = v.date AND op.type = 2
                    WHERE
                        1`;

  for (key in data) {
    switch (key) {
      case "attendanceDate":
        query += " AND v.date LIKE '" + data[key] + "'";
        break;
      // case 'userId':
      //     query += " AND ua." + key + " IN (" + data[key] + ")";
      //     break;
      case "dateBetween":
        let date = data[key].split("|");
        query += " AND v.date BETWEEN '" + date[0] + "' AND '" + date[1] + "'";
        break;
    }
  }

  query += ` ORDER BY 
                    v.date ASC`;

  console.log("query", query);
  sql.query(query, function (err, rows, fileds) {
    if (err) {
      callback({ status: false, msg: "Something went wrong" });
    } else {
      callback({ status: true, data: rows });
    }
  });
};

UserDetails.prototype.updateUserDetails = async function (data, callback) {
  let query = "UPDATE userDetails SET ";
  let updateQueryStack = [];

  for (key in data) {
    switch (key) {
      case "name":
        updateQueryStack.push(key + "='" + data[key] + "'");
        break;
      case "profilePic":
        updateQueryStack.push(key + "='" + data[key] + "'");
        break;
    }
  }

  if (
    updateQueryStack.length > 0 &&
    typeof data.userId !== "undefined" &&
    data.userId !== null
  ) {
    query += updateQueryStack.join(",");
    query += " WHERE id = " + data.userId;
    console.log("query", query);

    sql.query(query, function (err, result) {
      if (err) {
        callback({ status: false, msg: "Something went wrong" });
      } else {
        callback({
          status: true,
          data: result.affectedRows + " records updated",
        });
      }
    });
  } else {
    callback({ status: false, msg: "No Data to update" });
  }
};

UserDetails.prototype.getUserAttendanceReport = async function (
  data,
  callback
) {
  let dateBetween = data["dateBetween"].split("|");
  let query =
    `SELECT
                    userList.id AS userId,
                    userList.name,
                    userList.email,
                    COALESCE(holidayCount.totalDays) AS totalDays,
                    COALESCE(
                        userAttendanceList.presentMark,
                        0
                    ) AS presentMark,
                    COALESCE(
                        userAttendanceList.absentMark,
                        0
                    ) AS absentMark,
                    holidayCount.holidayCount,
                    (
                        COALESCE(
                            userAttendanceList.presentMark,
                            0
                        ) + COALESCE(holidayCount.holidayCount)
                    ) AS paybleDays,
                    (
                        COALESCE(holidayCount.totalDays) -(
                            COALESCE(
                                userAttendanceList.presentMark,
                                0
                            ) + COALESCE(holidayCount.holidayCount)
                        )
                    ) AS nonPaybleDays
                FROM
                    (
                SELECT
                    *
                FROM
                    userDetails WHERE userType = 1 AND ifActive = 1
                ) AS userList
                LEFT JOIN(
                    SELECT
                        ua.userId AS userId,
                        SUM(
                            (
                                CASE WHEN ua.status = 6 THEN 1 ELSE 0
                            END
                            )
                        ) AS absentMark,
                        SUM(
                            (
                                CASE WHEN ua.status != 6 THEN 1 ELSE 0
                            END
                        )
                        ) AS presentMark
                        FROM
                            userAttendance ua WHERE ua.attendanceDate BETWEEN '` +
    dateBetween[0] +
    `' AND '` +
    dateBetween[1] +
    `'
                        GROUP BY
                            ua.userId
                ) AS userAttendanceList
                ON
                    userAttendanceList.userId = userList.id
                LEFT JOIN(
                    SELECT
                        SUM(
                            (
                                CASE WHEN(DAYOFWEEK(v.date) = 1) OR(DAYOFWEEK(v.date) = 7) OR(hc.holidayName IS NOT NULL) THEN 1 ELSE 0
                            END
                        )
                ) AS holidayCount,
                SUM(
                    (
                        CASE WHEN v.date IS NOT NULL THEN 1 ELSE 0
                    END
                )
                ) AS totalDays
                FROM
                    (
                    SELECT
                        ADDDATE(
                            '1970-01-01',
                            t4.i * 10000 + t3.i * 1000 + t2.i * 100 + t1.i * 10 + t0.i
                        ) AS DATE
                    FROM
                        (
                        SELECT
                            0 i
                        UNION
                        SELECT
                            1
                        UNION
                        SELECT
                            2
                        UNION
                        SELECT
                            3
                        UNION
                        SELECT
                            4
                        UNION
                        SELECT
                            5
                        UNION
                        SELECT
                            6
                        UNION
                        SELECT
                            7
                        UNION
                        SELECT
                            8
                        UNION
                        SELECT
                            9
                            ) t0,
                            (
                            SELECT
                                0 i
                            UNION
                        SELECT
                            1
                        UNION
                        SELECT
                            2
                        UNION
                        SELECT
                            3
                        UNION
                        SELECT
                            4
                        UNION
                        SELECT
                            5
                        UNION
                        SELECT
                            6
                        UNION
                        SELECT
                            7
                        UNION
                        SELECT
                            8
                        UNION
                        SELECT
                            9
                        ) t1,
                        (
                            SELECT
                                0 i
                            UNION
                        SELECT
                            1
                        UNION
                        SELECT
                            2
                        UNION
                        SELECT
                            3
                        UNION
                        SELECT
                            4
                        UNION
                        SELECT
                            5
                        UNION
                        SELECT
                            6
                        UNION
                        SELECT
                            7
                        UNION
                        SELECT
                            8
                        UNION
                        SELECT
                            9
                        ) t2,
                        (
                            SELECT
                                0 i
                            UNION
                        SELECT
                            1
                        UNION
                        SELECT
                            2
                        UNION
                        SELECT
                            3
                        UNION
                        SELECT
                            4
                        UNION
                        SELECT
                            5
                        UNION
                        SELECT
                            6
                        UNION
                        SELECT
                            7
                        UNION
                        SELECT
                            8
                        UNION
                        SELECT
                            9
                        ) t3,
                        (
                            SELECT
                                0 i
                            UNION
                        SELECT
                            1
                        UNION
                        SELECT
                            2
                        UNION
                        SELECT
                            3
                        UNION
                        SELECT
                            4
                        UNION
                        SELECT
                            5
                        UNION
                        SELECT
                            6
                        UNION
                        SELECT
                            7
                        UNION
                        SELECT
                            8
                        UNION
                        SELECT
                            9
                        ) t4
                        ) v
                LEFT JOIN holidayCalender hc ON
                    hc.date = v.date AND hc.type = 1
                WHERE
                    v.date BETWEEN '` +
    dateBetween[0] +
    `' AND '` +
    dateBetween[1] +
    `'
                ) AS holidayCount
                ON
                    1 = 1 ORDER BY userList.name ASC`;

  console.log("query", query);
  sql.query(query, function (err, rows, fileds) {
    if (err) {
      callback({ status: false, msg: err });
    } else {
      callback({ status: true, data: rows });
    }
  });
};

module.exports = new UserDetails();
