var sql = require("../../src/config/db.js");

const Status = function () {};

Status.prototype.getStatus = async function (data, callback) {
  sql.query(
    "SELECT * FROM status WHERE ifActive = 1",
    function (err, rows, fields) {
      if (err) {
        callback({ status: false, msg: err });
      }
      callback({ status: true, data: rows });
    }
  );
};

module.exports = new Status();
