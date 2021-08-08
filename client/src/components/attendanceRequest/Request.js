import React from "react";
import Header from "../header/Header";
import moment from "moment";
import Axios from "axios";
import "../../components/attendanceRequest/Request.css";
import $ from "jquery";
var config = require("../../config/config");
const queryString = require("query-string");
var jwt = require("jsonwebtoken");

class AttendanceRequest extends React.Component {
  constructor(props) {
    super(props);

    let userDetails = localStorage.getItem("token");
    if (userDetails != null) {
      userDetails = jwt.decode(userDetails, config.JWT_SECRET);
    } else {
      userDetails = {};
    }

    this.state = {
      requestList: [],
      userDetails: userDetails,
    };

    this.getAttendanceRequest = this.getAttendanceRequest.bind(this);
    this.fixedFirstColumnForMobile = this.fixedFirstColumnForMobile.bind(this);
    this.preprateTableData = this.preprateTableData.bind(this);
    this.updateAttendanceRequest = this.updateAttendanceRequest.bind(this);
  }

  componentWillMount() {
    this.getAttendanceRequest();
  }

  updateAttendanceRequest(requestId, status, userId) {
    let that = this;
    let axiosData = {
      requestId: requestId,
      userId: userId,
      status: status,
    };
    Axios.post(
      config.API_BASE + "/attendance/updateAttendanceRequest",
      axiosData
    )
      .then(function (response) {
        let res = response.data;
        if (res.status) {
          let requestList = that.state.requestList.filter(function (
            value,
            index
          ) {
            return value.id != requestId;
          });

          that.setState({ requestList: requestList });
        }
      })
      .catch(function (error) {
        console.log("error", error);
      });
  }

  fixedFirstColumnForMobile() {
    var $table = $(".table");
    var $fixedColumn = $table
      .clone()
      .insertBefore($table)
      .addClass("fixed-column");

    $fixedColumn.find("th:not(:first-child),td:not(:first-child)").remove();

    $fixedColumn.find("tr").each(function (i, elem) {
      $(this).height($table.find("tr:eq(" + i + ")").height());
    });
  }

  getAttendanceRequest() {
    let that = this;
    const startOfMonth = moment()
      .startOf("month")
      .format(config.API_DATE_FORMAT);
    const endOfMonth = moment().endOf("month").format(config.API_DATE_FORMAT);
    let axiosData = {
      status: 0,
      date: startOfMonth + "|" + endOfMonth,
    };
    Axios.get(
      config.API_BASE +
        "/attendance/getAttendanceRequest?" +
        queryString.stringify(axiosData)
    )
      .then(function (response) {
        let res = response.data;
        if (res.status) {
          let requestList = typeof res.data !== "undefined" ? res.data : [];
          that.setState(
            { requestList: requestList },
            that.fixedFirstColumnForMobile
          );
        }
      })
      .catch(function (error) {
        console.log("error", error);
      });
  }

  preprateTableData() {
    let row = [];
    let that = this;

    this.state.requestList.map(function (value, index) {
      row.push(
        <tr>
          <td>{value.name}</td>
          <td>{value.statusName}</td>
          <td>{value.task}</td>
          <td>{value.additionalNotes}</td>
          <td>{moment(value.date).format("ll")}</td>
          <td>
            <button
              onClick={that.updateAttendanceRequest.bind(
                that,
                value.id,
                1,
                value.userId
              )}
            >
              <i className="fa fa-check" aria-hidden="true"></i>
            </button>
            <button
              onClick={that.updateAttendanceRequest.bind(
                that,
                value.id,
                2,
                value.userId
              )}
              className="closeBtn"
            >
              <i className="fa fa-close"></i>
            </button>
          </td>
        </tr>
      );
    });

    return row;
  }

  render() {
    let tableRows = this.preprateTableData();

    return (
      <>
        <Header />
        <div className="container-fluid attendanceRequestSection">
          <div className="row taskListMain">
            <div className="col-xs-12">
              <div className="card">
                <div className="titleText">Requests for Attendance</div>
                {this.state.requestList.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover table-condensed">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Status</th>
                          <th>Task</th>
                          <th>Additional Notes</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>{tableRows}</tbody>
                    </table>
                  </div>
                ) : (
                  <h3>No Results Found</h3>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default AttendanceRequest;
