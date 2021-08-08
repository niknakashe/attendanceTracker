import React from "react";
import Header from "../header/Header";
import Axios from "axios";
import moment from "moment";
import "../../components/attendanceReport/Report.css";
import $ from "jquery";
import DayPickerInput from "react-day-picker/DayPickerInput";
import "react-day-picker/lib/style.css";
import { formatDate, parseDate } from "react-day-picker/moment";
import "../../components/attendanceReport/Report.css";
const config = require("../../config/config");
const queryString = require("query-string");

class Report extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      reportList: [],
      // 'startDate': moment().subtract(1, 'month').startOf('month').add(24, 'day').format('ll'),
      // 'endDate': moment().startOf('month').add(24, 'day').format('ll')
      startDate: moment().startOf("month").format("ll"),
      endDate: moment().endOf("month").format("ll"),
    };

    this.getReport = this.getReport.bind(this);
    // this.fixedFirstColumnForMobile = this.fixedFirstColumnForMobile.bind(this);
    this.prepareTableRows = this.prepareTableRows.bind(this);
    this.handleStartDayChange = this.handleStartDayChange.bind(this);
    this.handleEndDayChange = this.handleEndDayChange.bind(this);
  }

  componentWillMount() {
    this.getReport();
  }

  handleStartDayChange(selectedDay, modifiers, dayPickerInput) {
    const input = dayPickerInput.getInput();
    this.setState({
      startDate: selectedDay,
    });
  }

  handleEndDayChange(selectedDay, modifiers, dayPickerInput) {
    const input = dayPickerInput.getInput();
    this.setState({
      endDate: selectedDay,
    });
  }

  // fixedFirstColumnForMobile() {
  //     var $table = $('.table');
  //     var $fixedColumn = $table.clone().insertBefore($table).addClass('fixed-column');

  //     $fixedColumn.find('th:not(:first-child),td:not(:first-child)').remove();

  //     $fixedColumn.find('tr').each(function (i, elem) {
  //         $(this).height($table.find('tr:eq(' + i + ')').height());
  //     });
  // }

  getReport() {
    let that = this;
    const startOfMonth = moment(this.state.startDate).format(
      config.API_DATE_FORMAT
    );
    const endOfMonth = moment(this.state.endDate).format(
      config.API_DATE_FORMAT
    );
    let axiosData = {
      dateBetween: startOfMonth + "|" + endOfMonth,
    };
    Axios.get(
      config.API_BASE +
        "/user/getUserAttendanceReport?" +
        queryString.stringify(axiosData)
    )
      .then(function (response) {
        let res = response.data;
        if (res.status) {
          let reportList = typeof res.data !== "undefined" ? res.data : [];
          that.setState({ reportList: reportList });
        }
      })
      .catch(function (error) {
        console.log("error", error);
      });
  }

  prepareTableRows() {
    let rows = [];
    let emailFormat = "";

    this.state.reportList.map(function (value, index) {
      try {
        emailFormat = value.email.substring(0, value.email.lastIndexOf("@"));
        emailFormat = emailFormat.split(".").join(" ");
      } catch (err) {
        emailFormat = value.email;
      }
      rows.push(
        <tr>
          <td className="name">
            {value.name != null ? value.name : emailFormat}
          </td>
          <td>{value.totalDays}</td>
          <td>{value.holidayCount}</td>
          <td>{value.presentMark}</td>
          <td>{value.absentMark}</td>
          <td style={{ color: "green", "font-weight": "bold" }}>
            {value.paybleDays}
          </td>
          <td style={{ color: "red", "font-weight": "bold" }}>
            {value.nonPaybleDays}
          </td>
        </tr>
      );
    });

    return rows;
  }

  render() {
    let tableRows = this.prepareTableRows();
    return (
      <>
        <Header />
        <div className="container-fluid">
          <div className="reportSectionMain card">
            <div className="row filterSection">
              <div className="col-xs-12 displayFlex">
                <div class="form-group">
                  <label className="startDateInput" htmlFor="startDateInput">
                    Start Date
                  </label>
                  <div id="startDateInput">
                    <DayPickerInput
                      value={this.state.startDate}
                      onDayChange={this.handleStartDayChange}
                      placeholder="Start Date"
                      formatDate={formatDate}
                      parseDate={parseDate}
                      format="LL"
                      dayPickerProps={{
                        format: "YYYY M D",
                        selectedDays: this.state.startDate,
                        disabledDays: [
                          {
                            after: new Date(this.state.endDate),
                          },
                        ],
                        // disabledDays: [{
                        //     daysOfWeek: [0, 6],
                        // },
                        // {
                        //     after: new Date(this.state.endDate)
                        // },
                        // {
                        //     before: new Date(moment().startOf('month').format('YYYY-MM-DD hh:mm')),
                        //     after: new Date(moment().endOf('month').format('YYYY-MM-DD hh:mm'))
                        // }],
                      }}
                    />
                  </div>
                </div>
                <div class="form-group endDateFormGroup">
                  <label className="endDateInput" htmlFor="endDateInput">
                    End Date
                  </label>
                  <div id="endDateInput">
                    <DayPickerInput
                      value={this.state.endDate}
                      placeholder="End Date"
                      formatDate={formatDate}
                      parseDate={parseDate}
                      format="LL"
                      onDayChange={this.handleEndDayChange}
                      dayPickerProps={{
                        format: "YYYY-M-D",
                        selectedDays: this.state.endDate,
                        disabledDays: [
                          {
                            before: new Date(this.state.startDate),
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
                <button className="filterBtn btn" onClick={this.getReport}>
                  Filter
                </button>
              </div>
            </div>
            <div className="row tableSection">
              <div className="col-xs-12">
                <div className="table-responsive">
                  <table className="table table-striped table-bordered table-hover table-condensed">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Total Days</th>
                        <th>Holiday / Weekend Days</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th style={{ color: "green" }}>Total Payable Days</th>
                        <th style={{ color: "red" }}>Total Non Payable Days</th>
                      </tr>
                    </thead>
                    <tbody>{tableRows}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Report;
