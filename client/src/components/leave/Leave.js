import React from 'react';
import Header from '../header/Header';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { Form } from 'react-bootstrap';
import '../leave/Leave.css';
import moment from 'moment';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { formatDate, parseDate } from 'react-day-picker/moment';
import 'react-toastify/dist/ReactToastify.css';
var queryString = require('query-string');
var config = require('../../config/config');
var jwt = require('jsonwebtoken');

class Leave extends React.Component {
    constructor(props) {
        super(props);

        let userDetails = localStorage.getItem("token");
        if (userDetails != null) {
            userDetails = jwt.decode(userDetails, config.JWT_SECRET);
        }
        else {
            userDetails = {};
        }

        this.state = {
            userDetails: userDetails,
            startDate: undefined,
            endDate: undefined,
            leaveType: 0,
            chHoliday: 0,
            comment: "",
            opHolidayList: [],
            leaveBalance: {
                plBalance: 0,
                chBalance: 0
            },
            leaveHistory: [],
            btnBlock: false
        }

        this.handleStartDayChange = this.handleStartDayChange.bind(this);
        this.handleEndDayChange = this.handleEndDayChange.bind(this);
        this.getOptionalHolidayList = this.getOptionalHolidayList.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.prepareTableForLeaveHistory = this.prepareTableForLeaveHistory.bind(this);
        this.isValid = this.isValid.bind(this);
        this.onLeaveSubmit = this.onLeaveSubmit.bind(this);
    }

    componentDidMount() {
        this.getOptionalHolidayList();
        this.getUserLeaves();
        this.getLeaveHistory();
    }

    getLeaveHistory() {
        let that = this;
        Axios.get(config.API_BASE + "/leave/getUserLeaveHistory?" + queryString.stringify({
            "userId": that.state.userDetails.id,
            "dateBetween": moment().format("YYYY") + "-01-01|" + moment().format("YYYY") + "-12-31"
        }))
            .then(function (response) {
                let res = response.data;
                if (res.status && typeof res.data !== 'undefined' && res.data.length > 0) {

                    that.setState({ 'leaveHistory': res.data });
                }
            })
            .catch(function (error) {
                console.log('error', error);
            })
    }

    getUserLeaves() {
        let that = this;
        Axios.get(config.API_BASE + "/leave/getUserLeaves?" + queryString.stringify({
            "userId": that.state.userDetails.id
        }))
            .then(function (response) {
                let res = response.data;
                if (res.status && typeof res.data !== 'undefined' && res.data.length > 0) {
                    let leaveObject = res.data[0];

                    that.setState({ 'leaveBalance': leaveObject });
                }
            })
            .catch(function (error) {
                console.log('error', error);
            })
    }

    handleStartDayChange(selectedDay, modifiers, dayPickerInput) {
        const input = dayPickerInput.getInput();
        this.setState({
            'startDate': selectedDay
        });
    }

    handleChange(stateName, evt) {
        let state = this.state;
        state[stateName] = evt.target.value;

        this.setState({ state });
    }

    handleEndDayChange(selectedDay, modifiers, dayPickerInput) {
        const input = dayPickerInput.getInput();
        this.setState({
            'endDate': selectedDay
        });
    }

    getOptionalHolidayList() {
        let that = this;
        Axios.get(config.API_BASE + "/calender/getHolidayList?" + queryString.stringify({
            "type": 2,
            "dateBetween": moment().format("YYYY") + "-01-01|" + moment().format("YYYY") + "-12-31"
        }))
            .then(function (response) {
                let res = response.data;
                if (res.status && typeof res.data !== 'undefined') {
                    let list = res.data;

                    that.setState({ 'opHolidayList': list });
                }
            })
            .catch(function (error) {
                console.log('error', error);
            })
    }

    prepareTableForLeaveHistory() {
        let leaveHistory = this.state.leaveHistory;
        let rows = [];

        leaveHistory.map(function (value, index) {
            rows.push(
                <tr>
                    <td>{moment(value.startDate).format("ll")}</td>
                    <td>{value.leaveType == 1 ? "PL" : value.leaveType == 2 ? "CH" : "NA"}</td>
                    <td>{value.transactionType == 1 ? "-" + value.noOfDays : value.transactionType == 2 ? "+" + value.noOfDays : "NA"}</td>
                </tr>
            )
        });

        return rows;
    }

    isValid() {
        let isValid = true;
        let state = this.state;

        if (this.state.leaveType == 0) {
            toast.error("Please Select Leave Type");
            return false;
        }
        else if (this.state.leaveType == 1) {
            let requiredParams = ['startDate', 'endDate'];
            requiredParams.map(function (value, index) {
                if (state[value] === undefined || state[value] == "" || state[value] == null) {
                    isValid = false;
                    return false;
                }
            });

            let willDeduct = 0;
            if (this.state.startDate != undefined && this.state.endDate != undefined) {
                willDeduct = moment(this.state.endDate).diff(this.state.startDate, 'days') + 1;
            }
            if (this.state.leaveBalance.plBalance < willDeduct) {
                toast.error("Insufficient Leave Balance");
                return false;
            }
        }
        else if (this.state.leaveType == 2) {
            let requiredParams = ['chHoliday'];

            requiredParams.map(function (value, index) {
                if (typeof state[value] === 'undefined' || state[value] == "" || state[value] == null || state[value] == 0) {
                    return false;
                }
            });

            if (this.state.leaveBalance.chBalance < 1) {
                toast.error("Insufficient Leave Balance");
                return false;
            }
        }

        return isValid;
    }

    onLeaveSubmit(evt) {
        evt.preventDefault();
        if (!this.isValid()) {
            toast.error("Please fill required details");
            return false;
        }

        this.setState({ 'btnBlock': true }, function () {
            let axiosData = {
                "userId": this.state.userDetails.id,
                "leaveType": this.state.leaveType,
                "noOfDays": 1,
                "transactionType": 1,
                "comment": this.state.comment
            }
            if (this.state.leaveType == 1) {
                axiosData.startDate = this.state.startDate;
                axiosData.endDate = this.state.endDate;
                let willDeduct = 0;
                if (this.state.startDate != undefined && this.state.endDate != undefined) {
                    willDeduct = moment(this.state.endDate).diff(this.state.startDate, 'days') + 1;
                }
                axiosData.noOfDays = willDeduct;
            }
            else if (this.state.leaveType == 2) {
                axiosData.startDate = this.state.chHoliday;
                axiosData.endDate = this.state.chHoliday;
                axiosData.willDeduct = 1;
            }

            let that = this;
            Axios.post(config.API_BASE + "/leave/insertLeaveDetails?", axiosData)
                .then(function (response) {
                    let res = response.data;
                    console.log('resonspe', res);
                    if (res.status) {
                        toast.success("Data successfully inserted");
                        window.location.reload();
                    }
                    else {
                        that.setState({ 'btnBlock': false });
                    }
                })
                .catch(function (error) {
                    that.setState({ 'btnBlock': false });
                    console.log('error', error);
                })
        })
    }

    render() {
        let chOptions = this.state.opHolidayList.map(function (value, index) {
            return (<option value={value.date}>{value.holidayName + moment(value.date).format(" (Do MMM)")}</option>)
        });

        let willDeduct = 0;
        if (this.state.startDate != undefined && this.state.endDate != undefined) {
            willDeduct = moment(this.state.endDate).diff(this.state.startDate, 'days') + 1;
        }
        let tableRows = this.prepareTableForLeaveHistory();

        return (
            <>
                <Header />
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xs-12 col-md-3 col-lg-3 column">
                            <div className="card leaveRemaining">
                                <h3>Leave Balance</h3>
                                <div className="leave">
                                    Paid Leave - {this.state.leaveBalance.plBalance}
                                </div>
                                <div className="ch">
                                    Choice Holiday - {this.state.leaveBalance.chBalance}
                                </div>
                            </div>
                        </div>
                        <div className="col-xs-12 col-md-5 col-lg-5 column">
                            <div className="card">
                                <div className="leaveForm">
                                    <h3>Apply Leave</h3>
                                </div>
                                <form class="form-horizontal leaveForm2">
                                    <div class="form-group leaveTypeGroup">
                                        <label class="control-label col-sm-3" for="leaveType">Leave Type:</label>
                                        <div class="col-sm-9 select">
                                            <select class="form-control" id="leaveType" value={this.state.leaveType} onChange={this.handleChange.bind(this, 'leaveType')}>
                                                <option value={0}>Select</option>
                                                <option value={1}>Paid Leave</option>
                                                <option value={2}>Optional Leave</option>
                                            </select>
                                        </div>
                                    </div>
                                    {
                                        this.state.leaveType == 1
                                            ?
                                            <>
                                                <div class="form-group startDateGroup">
                                                    <label class="control-label col-sm-3" for="startDate">Start Date:</label>
                                                    <div class="col-sm-9">
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
                                                                disabledDays: [{
                                                                    daysOfWeek: [0, 6],
                                                                },
                                                                {
                                                                    after: new Date(this.state.endDate)
                                                                },
                                                                {
                                                                    before: new Date(moment().startOf('month').format('YYYY-MM-DD hh:mm')),
                                                                    // after: new Date(moment().endOf('month').format('YYYY-MM-DD hh:mm'))
                                                                }],
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div class="form-group">
                                                    <label class="control-label col-sm-3" for="endDate">End Date:</label>
                                                    <div class="col-sm-9">
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
                                                                disabledDays: [{
                                                                    daysOfWeek: [0, 6],
                                                                },
                                                                {
                                                                    before: new Date(this.state.startDate)
                                                                },
                                                                {
                                                                    before: new Date(moment().startOf('month').format('YYYY-MM-DD hh:mm')),
                                                                    // after: new Date(moment().endOf('month').format('YYYY-MM-DD hh:mm'))
                                                                }],
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                            :
                                            ""
                                    }
                                    {
                                        this.state.leaveType == 2
                                            ?
                                            <div class="form-group choiceHolidayGroup">
                                                <label class="control-label col-sm-3" for="holidayDate">Choice Holiday:</label>
                                                <div class="col-sm-9 select">
                                                    <select class="form-control" id="holidayDate" value={this.state.chHoliday} onChange={this.handleChange.bind(this, 'chHoliday')}>
                                                        <option value={0}>Select</option>
                                                        {chOptions}
                                                    </select>
                                                </div>
                                            </div>
                                            :
                                            ""
                                    }
                                    {
                                        this.state.leaveType != 0
                                            ?
                                            <div class="form-group leaveBalance">
                                                <label class="control-label col-sm-3" for="leaveBalance">Leave Balance:</label>
                                                <div class="col-sm-9">
                                                    <input readOnly class="form-control" value={this.state.leaveType == 1 ? this.state.leaveBalance.plBalance : this.state.leaveBalance.chBalance} />
                                                </div>
                                            </div>
                                            :
                                            ""
                                    }
                                    {
                                        this.state.leaveType != 0 && this.state.leaveType == 1
                                            ?
                                            <div class="form-group willDeduct">
                                                <label class="control-label col-sm-3" for="comment">Will Deduct:</label>
                                                <div class="col-sm-9">
                                                    <input readOnly class={willDeduct > this.state.leaveBalance.plBalance ? "form-control warning" : "form-control"} value={willDeduct} />
                                                </div>
                                            </div>
                                            :
                                            ""
                                    }

                                    <div class="form-group">
                                        <label class="control-label col-sm-3" for="comment">Comment:</label>
                                        <div class="col-sm-9">
                                            <Form.Control as="textarea" rows="3" value={this.state.comment} onChange={this.handleChange.bind(this, 'comment')} />
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-sm-12 submitButton">
                                            <button class="btn btn-default" onClick={this.onLeaveSubmit} disabled={this.state.btnBlock}>Submit</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-xs-12 col-md-4 col-lg-4 column">
                            <div className="card leaveHistory">
                                <h3>Leave History</h3>
                                {
                                    tableRows.length == 0
                                        ?
                                        <div className="noRecordFound">No Record Found</div>
                                        :
                                        <div className="table-responsive">
                                            <table className="table table-striped table-bordered table-hover table-condensed">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Leave Type</th>
                                                        <th>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tableRows}
                                                </tbody>
                                            </table>
                                        </div>
                                }

                            </div>
                        </div>
                    </div>
                </div>
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
            </>
        )
    }

}

export default Leave;