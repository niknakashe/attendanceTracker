import React, { useState, useEffect } from "react";
import "../dashboard/Dashboard.css";
import moment from "moment";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import Axios from "axios";
import Header from "../header/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
var config = require("../../config/config");
var jwt = require("jsonwebtoken");

let momentUiDateFormat = "Do MMMM YYYY";
let startYear = 2014;
let todayDate = new Date();
let thisYear = todayDate.getFullYear() + 2;
let API_DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
let API_DATE_FORMAT = "YYYY-MM-DD";
let DATE_START_FORMAT = "YYYY-MM-DD 00:00:00";
let DATE_END_FORMAT = "YYYY-MM-DD 23:59:59";
let blockTime = "11:00am";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    let userDetails = localStorage.getItem("token");
    if (userDetails != null) {
      userDetails = jwt.decode(userDetails, config.JWT_SECRET);
    }

    this.state = {
      month: ("0" + (moment().month() + 1)).slice(-2),
      year: moment().year(),
      calendarData: [],
      cellDetails: {},
      selectedCell: moment().format(API_DATE_FORMAT),
      showStatusModal: false,
      status: [],
      userDetails: userDetails,
      requestAdmin: false,
    };

    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this);
    this.changeStatusModal = this.changeStatusModal.bind(this);
    this.getAllMarkStatus = this.getAllMarkStatus.bind(this);
    this.getCalenderData = this.getCalenderData.bind(this);
  }

  componentWillMount() {
    this.getAllMarkStatus();
    let weekday = moment().weekday();
    if (weekday != 0 && weekday != 6) {
      this.getUserTodayStatus();
    }
    this.getCalenderData();
  }

  getCalenderData() {
    let that = this;

    let tempStartDate = this.state.year + "-" + this.state.month + "-01";
    let endOfMonth = moment(tempStartDate)
      .endOf("month")
      .format(config.API_DATE_FORMAT);
    let startOfMonth = moment(tempStartDate)
      .startOf("month")
      .format(config.API_DATE_FORMAT);

    Axios.post(config.API_BASE + "/user/getUserAttendanceCalender", {
      userId: this.state.userDetails.id,
      dateBetween: startOfMonth + "|" + endOfMonth,
    })
      .then(function (response) {
        let res = response.data;
        if (res.status) {
          let calenderData = typeof res.data !== "undefined" ? res.data : [];
          let formatCalenderData = {};
          let cellDetails = {};

          calenderData.map(function (value, index) {
            formatCalenderData[
              moment(value.calenderDate).format(API_DATE_FORMAT)
            ] = value;
            if (
              moment(value.calenderDate).format(API_DATE_FORMAT) ==
              that.state.selectedCell
            ) {
              cellDetails = value;
            }
          });
          that.setState({
            calendarData: formatCalenderData,
            cellDetails: cellDetails,
          });
        }
      })
      .catch(function (error) {
        console.log("error", error);
      });
  }

  getUserTodayStatus() {
    let that = this;
    Axios.post(config.API_BASE + "/user/getUserAttendance", {
      userId: this.state.userDetails.id,
      attendanceDate: moment().format(API_DATE_FORMAT),
    })
      .then(function (response) {
        let res = response.data;
        if (res.status) {
          //After 11 don not show modal
          if (
            typeof res.data !== "undefined" &&
            res.data.length == 0 &&
            moment().isBefore(moment(blockTime, "h:mma"))
          ) {
            that.changeStatusModal(true);
          }
        }
      })
      .catch(function (error) {
        console.log("error", error);
      });
  }

  getAllMarkStatus() {
    let that = this;
    Axios.get(config.API_BASE + "/status/getStatus")
      .then(function (response) {
        let res = response.data;
        that.setState({ status: res.data });
      })
      .catch(function (error) {
        console.log("error", error);
      });
  }

  handleDateChange(year, month) {
    this.setState(
      { month: month, year: year, selectedCell: 0 },
      this.getCalenderData
    );
  }

  handleCellClick(data) {
    this.setState({ selectedCell: data.cellDate, cellDetails: data.cellData });
  }

  changeStatusModal(state, requestAdmin = false) {
    this.setState({ showStatusModal: state }, function () {
      if (state == true && requestAdmin == true) {
        this.setState({ requestAdmin: true });
      } else {
        this.setState({ requestAdmin: false });
      }
    });
  }

  render() {
    return (
      <>
        <Header />
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-8">
              <Calendar
                ref="cal"
                month={this.state.month}
                year={this.state.year}
                selectedVenues={this.state.selectedVenues}
                calendarData={this.state.calendarData}
                selectedCell={this.state.selectedCell}
                handleDateChange={this.handleDateChange}
                handleCellClick={this.handleCellClick}
              />
            </div>
            <div className="col-md-4">
              <CardDetails
                cellDetails={this.state.cellDetails}
                changeStatusModal={this.changeStatusModal}
              />
            </div>
          </div>
          <MarkStatusModal
            {...this.state}
            openModal={this.state.showStatusModal}
            changeStatusModal={this.changeStatusModal}
            getCalenderData={this.getCalenderData}
          />
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnVisibilityChange={false}
            draggable
            pauseOnHover={false}
          />
        </div>
      </>
    );
  }
}

class CardDetails extends React.Component {
  render() {
    let todayDate = moment().format(API_DATE_FORMAT);
    let cellDate = moment(this.props.cellDetails.calenderDate).format(
      API_DATE_FORMAT
    );
    let eligible = false;
    if (
      moment().isBefore(moment(blockTime, "h:mma")) &&
      todayDate == cellDate &&
      (typeof this.props.cellDetails.status === "undefined" ||
        this.props.cellDetails.status == null)
    ) {
      eligible = true;
    }
    return (
      <div className="cardDetails">
        {typeof this.props.cellDetails.holidayName !== "undefined" &&
        this.props.cellDetails.holidayName != null &&
        this.props.holidayName != "" ? (
          <div className="holidayName">
            Leave: {this.props.cellDetails.holidayName}
          </div>
        ) : (
          ""
        )}
        {typeof this.props.cellDetails.status === "undefined" ||
        this.props.cellDetails.status == null ? (
          <div>No record found</div>
        ) : (
          <>
            <div className="row">
              <div className="col-sm-12">
                <div className="date">
                  {moment(this.props.cellDetails.attendanceDate).format(
                    momentUiDateFormat
                  )}{" "}
                </div>
              </div>
            </div>
            <div className="row status">
              <div className="col-sm-4 bold">Status: </div>
              <div className="col-sm-8">
                {this.props.cellDetails.statusName}
              </div>
            </div>
            <div className="row task">
              <div className="col-sm-4 bold">Task: </div>
              <div className="col-sm-8 taskForDay">
                {this.props.cellDetails.taskForDay}
              </div>
            </div>
            {typeof this.props.cellDetails.additionalNote !== "undefined" &&
            this.props.cellDetails.additionalNote != null &&
            this.props.cellDetails.additionalNote != "" ? (
              <div className="row additionalNotes">
                <div className="col-sm-4 bold">Additional Notes: </div>
                <div className="col-sm-8 additionalNotesDay">
                  {this.props.cellDetails.additionalNote}
                </div>
              </div>
            ) : (
              ""
            )}
          </>
        )}
        {eligible ? (
          <div className="sendRequest">
            <button
              className="btn"
              onClick={this.props.changeStatusModal.bind(this, true, false)}
            >
              Mark Attendance
            </button>
          </div>
        ) : typeof this.props.cellDetails.markStatus !== "undefined" &&
          this.props.cellDetails.markStatus == 0 ? (
          <div className="sendRequest">
            <button
              className="btn"
              onClick={this.props.changeStatusModal.bind(this, true, true)}
            >
              Send Request to Admin
            </button>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

class Calendar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      calendarData: this.props.calendarData,
      month: this.props.month,
      year: this.props.year,
    };

    this.handleLeftArrowClick = this.handleLeftArrowClick.bind(this);
    this.handleRightArrowClick = this.handleRightArrowClick.bind(this);
    this.processArrowClick = this.processArrowClick.bind(this);
    this.resetToTodayDate = this.resetToTodayDate.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      calendarData: nextProps.calendarData,
      month: nextProps.month,
      year: nextProps.year,
    });
  }

  componentDidMount() {}

  getCalendarMonthObj(year, month) {
    let monthObj = {};
    let startDate = moment([year, month]);
    let dayOfWeek = startDate.weekday();
    let numberOfDays = startDate.endOf("month").date();
    let date = 1;
    for (let i = 0; i <= 5; i++) {
      monthObj[i] = {};
      for (let j = dayOfWeek; j < 7; j++) {
        if (date == numberOfDays + 1) {
          break;
        }
        monthObj[i][j] = date++;
      }
      dayOfWeek = 0;
    }
    return monthObj;
  }

  handleLeftArrowClick() {
    let newDate = moment([this.state.year, this.state.month - 1]).subtract(
      1,
      "months"
    );
    this.processArrowClick(newDate);
  }

  handleRightArrowClick() {
    let newDate = moment([this.state.year, this.state.month - 1]).add(
      1,
      "months"
    );
    this.processArrowClick(newDate);
  }

  processArrowClick(newDate) {
    this.state.year = newDate.format("YYYY");
    this.state.month = newDate.format("MM");

    if (typeof this.props.handleDateChange !== "undefined") {
      this.props.handleDateChange(this.state.year, this.state.month);
    }
  }

  resetToTodayDate() {
    let month = ("0" + (moment().month() + 1)).slice(-2);
    let year = moment().year();

    let data = {};
    data.day = ("0" + moment().date()).slice(-2);

    this.props.handleDateChange(year, month);

    let calendarData = this.state.calendarData;
    let todayDate = moment().format(config.API_DATE_FORMAT);

    if (typeof this.props.handleCellClick !== "undefined") {
      let data = {
        cellDate: todayDate,
        cellData:
          typeof calendarData[todayDate] !== "undefined"
            ? calendarData[todayDate]
            : {},
      };
      this.props.handleCellClick(data);
    }
  }

  render() {
    let MonthObj = this.getCalendarMonthObj(
      this.props.year,
      this.props.month - 1
    );
    let tableRows = [];
    let cell = [];
    let calendarData = this.state.calendarData;

    let cellBg = [];

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        let cellDate =
          this.props.year +
          "-" +
          this.props.month +
          "-" +
          ("0" + MonthObj[i][j]).slice(-2);
        let highLight = this.props.selectedCell == cellDate ? true : false;

        cellBg.push(
          <td
            className="fc-day fc-widget-content fc-sun fc-other-month fc-past"
            data-date={cellDate}
          ></td>
        );

        cell.push(
          <Cell
            {...this.props}
            highLight={highLight}
            reloadCalendar={this.props.reloadCalendar}
            key={j}
            month={this.props.month}
            year={this.props.year}
            day={MonthObj[i][j]}
            cellDate={cellDate}
            cellData={
              typeof calendarData[cellDate] !== "undefined"
                ? calendarData[cellDate]
                : {}
            }
            handleCellClick={this.props.handleCellClick}
          />
        );
      }
      tableRows.push(
        <div className="fc-row fc-week fc-widget-content fc-rigid">
          <div className="fc-bg">
            <table className="">
              <tbody>
                <tr>{cellBg}</tr>
              </tbody>
            </table>
          </div>
          <div className="fc-content-skeleton">
            <table>
              <thead>
                <tr>{cell}</tr>
              </thead>
            </table>
          </div>
        </div>
      );
      cell = [];
      cellBg = [];
    }

    let monthStartDate = this.props.year + "-" + this.props.month + "-01";

    return (
      <div className="card card-calendar">
        <div className="card-body ">
          <div id="fullCalendar" className="fc fc-unthemed fc-ltr">
            <div className="fc-toolbar fc-header-toolbar">
              <div className="fc-left">
                <h3>
                  {moment(monthStartDate).format("MMMM")} {this.state.year}
                </h3>
              </div>
              <div className="hidden-xs fc-right">
                <div className="fc-button-group">
                  <button
                    type="button"
                    className="fc-prev-button fc-button fc-state-default fc-corner-left"
                    aria-label="prev"
                    onClick={this.handleLeftArrowClick}
                  >
                    <span className="fc-icon fc-icon-left-single-arrow"></span>
                  </button>
                  <button
                    type="button"
                    className="fc-next-button fc-button fc-state-default"
                    aria-label="next"
                    onClick={this.handleRightArrowClick}
                  >
                    <span className="fc-icon fc-icon-right-single-arrow"></span>
                  </button>
                  <button
                    type="button"
                    className="fc-today-button fc-button fc-state-default fc-corner-right"
                    onClick={this.resetToTodayDate}
                  >
                    TODAY
                  </button>
                </div>
              </div>
              <div className="fc-center">
                <MonthFilter
                  month={this.state.month}
                  year={this.state.year}
                  handleDateChange={this.props.handleDateChange}
                />
              </div>
              <div className="fc-clear"></div>
            </div>
            <div className="fc-view-container">
              <div className="fc-view fc-month-view fc-basic-view">
                <table className="fc-main-view">
                  <thead className="fc-head">
                    <tr>
                      <td className="fc-head-container fc-widget-header">
                        <div className="fc-row fc-widget-header">
                          <table className="">
                            <thead>
                              <tr>
                                <th className="fc-day-header fc-widget-header fc-sun">
                                  <span>Sun</span>
                                </th>
                                <th className="fc-day-header fc-widget-header fc-mon">
                                  <span>Mon</span>
                                </th>
                                <th className="fc-day-header fc-widget-header fc-tue">
                                  <span>Tue</span>
                                </th>
                                <th className="fc-day-header fc-widget-header fc-wed">
                                  <span>Wed</span>
                                </th>
                                <th className="fc-day-header fc-widget-header fc-thu">
                                  <span>Thu</span>
                                </th>
                                <th className="fc-day-header fc-widget-header fc-fri">
                                  <span>Fri</span>
                                </th>
                                <th className="fc-day-header fc-widget-header fc-sat">
                                  <span>Sat</span>
                                </th>
                              </tr>
                            </thead>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </thead>
                  <tbody className="fc-body">
                    <tr>
                      <td className="fc-widget-content">
                        <div className="fc-scroller fc-day-grid-container">
                          <div className="fc-day-grid fc-unselectable">
                            {tableRows}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Cell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      year: this.props.year,
      month: this.props.month,
    };

    this.toggleDetailsModal = this.toggleDetailsModal.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this);
  }

  toggleDetailsModal(toggle) {
    this.setState({ detailsModal: toggle });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      year: nextProps.year,
      month: nextProps.month,
    });
  }

  handleCellClick(cellDate) {
    if (typeof this.props.day === "undefined") {
      return false;
    }

    if (typeof this.props.handleCellClick !== "undefined") {
      let data = {
        cellDate:
          this.state.year +
          "-" +
          this.state.month +
          "-" +
          ("0" + this.props.day).slice(-2),
        cellData: this.props.cellData,
      };
      this.props.handleCellClick(data);
    }
  }

  render() {
    let cellDate =
      this.state.year +
      "-" +
      this.state.month +
      "-" +
      ("0" + this.props.day).slice(-2);
    let className = this.props.highLight ? "selected-cell" : "";
    let cellData =
      typeof this.props.cellData !== "undefined" ? this.props.cellData : {};
    let momentDateWeek = moment(cellDate).format("dddd");
    let isWeekEnd =
      momentDateWeek === "Sunday" || momentDateWeek === "Saturday";
    let isHoliday =
      typeof cellData.holidayName !== "undefined" &&
      cellData.holidayName != null &&
      cellData.holidayName != "";
    let statusColor = cellData.statusColor;
    let statusShortName = cellData.shortName;
    if (moment().diff(cellDate) > 0) {
      statusColor =
        cellData.markStatus == 0 ? "rgb(218, 104, 104)" : cellData.statusColor;
      statusShortName =
        cellData.markStatus == 0 && cellData.status != 6
          ? "A"
          : cellData.shortName;
    }

    return (
      <td
        height="30"
        className={"fc-day fc-widget-content fc-past"}
        style={!isWeekEnd ? { "background-color": statusColor } : {}}
        data-date={cellDate}
        onClick={this.handleCellClick.bind(this, cellDate)}
      >
        <div style={{ marginTop: 10, marginRight: 10 }}>
          <div className="">
            <span
              className={
                this.props.highLight
                  ? "fc-day-number todayDate"
                  : "fc-day-number"
              }
            >
              {this.props.day}
            </span>
          </div>
        </div>
        <div className="hidden-xs">
          <div className="cellDataShortName">
            {isWeekEnd || isHoliday ? "L" : statusShortName}
          </div>
        </div>
      </td>
    );
  }
}

class MonthFilter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      year: this.props.year,
      month: this.props.month,
    };

    this.handleDateChange = this.handleDateChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      year: nextProps.year,
      month: nextProps.month,
    });
  }

  handleMonthChange(event) {
    this.setState({ month: event.target.value }, function () {
      this.handleDateChange();
    });
  }

  handleYearChange(event) {
    this.setState({ year: event.target.value }, function () {
      this.handleDateChange();
    });
  }

  handleDateChange() {
    this.props.handleDateChange(this.state.year, this.state.month);
  }

  render() {
    let temp = startYear;
    let option = [];
    while (temp <= thisYear) {
      temp++;
      option.push(
        <option key={temp} value={temp}>
          {temp}
        </option>
      );
    }

    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="col-xs-6 no-padding dropdown1">
            <select
              className="form-control select-box dropdown-width pull-right"
              id="month"
              value={this.state.month}
              onChange={this.handleMonthChange.bind(this)}
            >
              <option value="01">Jan</option>
              <option value="02">Feb</option>
              <option value="03">Mar</option>
              <option value="04">Apr</option>
              <option value="05">May</option>
              <option value="06">Jun</option>
              <option value="07">Jul</option>
              <option value="08">Aug</option>
              <option value="09">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
          </div>
          <div className="col-xs-6 no-padding dropdown1">
            <select
              className="form-control select-box center-block dropdown-width"
              id="year"
              value={this.state.year}
              onChange={this.handleYearChange.bind(this)}
            >
              {option}
            </select>
          </div>
        </div>
      </div>
    );
  }
}

class MarkStatusModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      details: {
        userId: this.props.userDetails.id,
        attendanceDate: moment(this.props.cellDetails.calenderDate).format(
          API_DATE_FORMAT
        ),
        taskForDay: "",
        status: 0,
        additionalNote: "",
      },
      btnDisable: false,
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.isValid = this.isValid.bind(this);
    this.submitDetails = this.submitDetails.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.submitDetailsAdmin = this.submitDetailsAdmin.bind(this);
    this.resetData = this.resetData.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    let details = this.state.details;
    details.attendanceDate = moment(nextProps.cellDetails.calenderDate).format(
      API_DATE_FORMAT
    );
    this.setState({
      show: nextProps.openModal,
      details: details,
    });
  }

  isValid() {
    let isValid = true;

    let details = this.state.details;
    let mendatoryFields = ["userId", "attendanceDate", "taskForDay", "status"];
    mendatoryFields.map(function (value, index) {
      if (
        typeof details[value] === "undefined" ||
        details[value] === "" ||
        details[value] == null
      ) {
        isValid = false;
        //exit from loop
        return false;
      }
    });
    if (typeof details.status === "undefined" || details.status == 0) {
      return false;
    }

    return isValid;
  }

  onSubmit() {
    if (this.props.requestAdmin) {
      this.submitDetailsAdmin();
    } else {
      this.submitDetails();
    }
  }

  submitDetailsAdmin() {
    if (!this.isValid()) {
      toast.error("Mendatory fields required");
      return false;
    }

    this.setState({ btnDisable: true }, function () {
      let that = this;
      let axiosData = {
        userId: this.props.userDetails.id,
        date: moment(this.state.details.attendanceDate).format(API_DATE_FORMAT),
        attendanceStatus: this.state.details.status,
        status: 0,
        task: this.state.details.taskForDay,
        additionalNotes: this.state.details.additionalNote,
      };

      Axios.post(
        config.API_BASE + "/attendance/insertAttendanceRequest",
        axiosData
      )
        .then(function (response) {
          let res = response.data;
          if (res.status) {
            toast.success("Request successfully sent to admin");
            if (typeof that.props.getCalenderData !== "undefined") {
              that.props.getCalenderData();
            }
            that.resetData();
            that.handleClose();
          } else {
            toast.error(res.msg);
          }
          that.setState({ btnDisable: false });
        })
        .catch(function (error) {
          that.setState({ btnDisable: false });
          console.log("error", error);
        });
    });
  }

  resetData() {
    let details = this.state.details;
    details.taskForDay = "";
    details.status = 0;
    details.additionalNote = "";

    this.setState({ details: details });
  }

  submitDetails() {
    if (!this.isValid()) {
      toast.error("Mendatory fields required");
      return false;
    }
    let that = this;
    this.setState({ btnDisable: true }, function () {
      Axios.post(config.API_BASE + "/user/insertUserStatus", this.state.details)
        .then(function (response) {
          let res = response.data;
          if (res.status) {
            toast.success("Status successfully updated");
            if (typeof that.props.getCalenderData !== "undefined") {
              that.props.getCalenderData();
            }
            that.resetData();
            that.handleClose();
          } else if (typeof res.msg !== "undefined") {
            toast.error(res.msg);
          } else {
            toast.error("Something went wrong");
          }
          that.setState({ btnDisable: false });
        })
        .catch(function (error) {
          console.log("error", error);
          toast.error("Something went wrong");
          that.setState({ btnDisable: false });
        });
    });
  }

  handleClose() {
    this.setState({ show: false }, function () {
      this.props.changeStatusModal(false);
    });
  }

  handleChange(state, evt) {
    let details = this.state.details;
    details[state] = evt.target.value;

    this.setState({ details: details });
  }

  render() {
    let details = this.state.details;
    let that = this;
    return (
      <>
        <Modal
          size="lg"
          show={this.state.show}
          onHide={this.handleClose}
          className="markStatusModal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Mark Your Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group as={Row} controlId="date">
                <Form.Label column sm="2">
                  Date
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    plaintext
                    readOnly
                    defaultValue={moment(details.attendanceDate).format(
                      momentUiDateFormat
                    )}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} controlId="statusmark">
                <Form.Label column sm="2" className="statusLabel">
                  Status <span className="compulsory">*</span>
                </Form.Label>
                <Col sm="10" className="statusNameCol">
                  <Form.Control
                    as="select"
                    value={details.status}
                    onChange={this.handleChange.bind(this, "status")}
                  >
                    <option value={0}>Select Option</option>
                    {this.props.status.map(function (value, index) {
                      if (
                        that.props.requestAdmin &&
                        (value.id == config.EARNED_LEAVE ||
                          value.id == config.OPTIONAL_HOLIDAY)
                      ) {
                        return;
                      }
                      return (
                        <option key={value.id} value={value.id}>
                          {value.statusName}
                        </option>
                      );
                    })}
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row} controlId="taskfortheday">
                <Form.Label column sm="2">
                  Task For The Day <span className="compulsory">*</span>
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    as="textarea"
                    rows="3"
                    value={details.taskForDay}
                    onChange={this.handleChange.bind(this, "taskForDay")}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} controlId="additionalNotes">
                <Form.Label column sm="2">
                  Additional Notes
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    as="textarea"
                    rows="3"
                    value={details.additionalNote}
                    onChange={this.handleChange.bind(this, "additionalNote")}
                  />
                </Col>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={this.handleClose}
              onClick={this.onSubmit}
              disabled={this.state.btnDisable}
            >
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

// function MarkStatusModal(props) {
//     const [show, setShow] = useState(props.openModal);

//     const handleClose = () => {
//         setShow(false);
//         props.changeStatusModal(false);
//     };
//     const handleShow = () => setShow(true);

//     useEffect(() => {
//         setShow(props.openModal);
//     }, [props.openModal])

//     return (

//     );
// }

export default Dashboard;
