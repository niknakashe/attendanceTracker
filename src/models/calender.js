var sql = require("../../src/config/db.js");

const Calender = function () {};

Calender.prototype.getHolidayList = async function (data, callback) {
  let query = "SELECT * FROM holidayCalender WHERE ifActive = 1";
  for (key in data) {
    switch (key) {
      case "dateBetween":
        let date = data[key].split("|");
        query += " AND date BETWEEN '" + date[0] + "' AND '" + date[1] + "'";
        break;
      case "type":
        query += " AND type = " + data[key];
        break;
    }
  }
  query += " ORDER BY date ASC";
  console.log("query", query);
  sql.query(query, function (err, rows, fields) {
    if (err) {
      callback({ status: false, msg: err });
    }
    callback({ status: true, data: rows });
  });
};

module.exports = new Calender();
