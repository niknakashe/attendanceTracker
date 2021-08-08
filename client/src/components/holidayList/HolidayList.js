import React from 'react';
import Header from '../header/Header';
import '../holidayList/HolidayList.css';
import Axios from 'axios';
import moment from 'moment';
import { Modal, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const config = require('../../config/config');
const queryString = require('query-string');
var jwt = require('jsonwebtoken');

class HolidayList extends React.Component {
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
            'calenderData': {},
            'showModal': false,
            'details': {},
            'userDetails': userDetails
        }

        this.getHolidayList = this.getHolidayList.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }

    componentWillMount() {
        this.getHolidayList();
    }

    toggleModal(toggle, holidayName, holidayDate) {
        console.log('name', holidayName);
        console.log('date', holidayDate);
        this.setState({ 'showModal': toggle }, function () {
            if (toggle) {
                this.setState({
                    'details': {
                        'name': holidayName,
                        'date': holidayDate
                    }
                });
            }
            else {
                this.setState({ 'details': {} })
            }
        });
    }

    getHolidayList() {
        let that = this;
        Axios.get(config.API_BASE + "/calender/getHolidayList?" + queryString.stringify({
            "dateBetween": moment().format("YYYY") + "-01-01|" + moment().format("YYYY") + "-12-31"
        }))
            .then(function (response) {
                let res = response.data;
                if (res.status && typeof res.data !== 'undefined') {
                    let calenderData = res.data;
                    let formatData = {};
                    calenderData.map(function (value, index) {
                        if (typeof formatData[moment(value.date).format(config.MOMENT_FULL_MONTH)] === 'undefined') {
                            formatData[moment(value.date).format(config.MOMENT_FULL_MONTH)] = [];
                        }
                        formatData[moment(value.date).format(config.MOMENT_FULL_MONTH)].push(value);
                    });
                    console.log('test', formatData);
                    that.setState({ 'calenderData': formatData });
                }
            })
            .catch(function (error) {
                console.log('error', error);
            })
    }

    render() {
        let calenderData = this.state.calenderData;
        let monthCard = [];
        let that = this;
        for (let key in calenderData) {
            let monthCardInternal = [];
            calenderData[key].map(function (value, index) {
                monthCardInternal.push(
                    <div className="row">
                        <div className="col-xs-4">{moment(value.date).format(config.MOMENT_HOLIDAY_FORMAT)}</div>
                        <div className="col-xs-5 holidayName">{value.holidayName}</div>
                        <div className="col-xs-3">{value.type == 2 ? <button className="chApplyBtn" onClick={that.toggleModal.bind(that, true, value.holidayName, value.date)}>Apply CH</button> : ""}</div>
                    </div>
                )
            })
            monthCard.push(
                <div class="col-xs-12 col-md-4 col-lg-3 column">
                    <div class="card">
                        <h3 className="month">{key}</h3>
                        {monthCardInternal}
                    </div>
                </div>
            )
        }
        return (
            <>
                <Header />
                <div className="container-fluid">
                    <div className="row heading">
                        <h2>Holiday List for {moment().format("YYYY")}</h2>
                    </div>
                    <div className="row">
                        {monthCard}
                    </div>
                </div>
                <ApplyLeaveModal
                    showModal={this.state.showModal}
                    userDetails={this.state.userDetails}
                    details={this.state.details}
                    toggleModal={this.toggleModal}
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
            </>
        )
    }
}

class ApplyLeaveModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'show': false,
            'leaveBalance': {
                plBalance: 0,
                chBalance: 0
            },
            'details': {

            },
            'comment': '',
            'btnDisable': false
        }

        this.handleClose = this.handleClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.getUserLeaves = this.getUserLeaves.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.isValid = this.isValid.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            'show': nextProps.showModal,
            'details': nextProps.details
        });
    }

    componentDidMount() {
        this.getUserLeaves();
    }

    handleClose() {
        this.setState({ 'show': false }, function () {
            if (typeof this.props.toggleModal !== 'undefined') {
                this.props.toggleModal(false);
            }
        })
    }

    getUserLeaves() {
        let that = this;
        Axios.get(config.API_BASE + "/leave/getUserLeaves?" + queryString.stringify({
            "userId": that.props.userDetails.id
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

    onSubmit() {
        let isValid = this.isValid();

        if (!isValid) {
            toast.error("Something went wrong. Contact admin.");
            return false;
        }

        this.setState({ 'btnDisable': true }, function () {
            let axiosData = {
                "userId": this.props.userDetails.id,
                "leaveType": 2, //Choice Holiday
                "noOfDays": 1,
                "transactionType": 1,
                "comment": this.state.comment,
                "startDate": moment(this.state.details.date).format(config.API_DATE_FORMAT),
                "endDate": moment(this.state.details.date).format(config.API_DATE_FORMAT)
            }

            let that = this;
            Axios.post(config.API_BASE + "/leave/insertLeaveDetails?", axiosData)
                .then(function (response) {
                    let res = response.data;
                    if (res.status) {
                        toast.success("Leave Successfully Applied.");
                        window.location.reload();
                    }
                    else if (typeof res.msg !== 'undefined') {
                        toast.error(res.msg);
                        that.setState({ 'btnDisable': false });
                    }
                    else {
                        toast.error("Oops! Something went wrong. Contact admin.");
                        that.setState({ 'btnDisable': false });
                    }
                })
                .catch(function (error) {
                    that.setState({ 'btnDisable': false });
                    toast.error("Something went wrong. Contact admin.");
                    console.log('error', error);
                })
        })
    }

    handleChange(evt) {
        this.setState({ 'comment': evt.target.value });
    }

    isValid() {
        let isValid = true;
        if (typeof this.state.details.date === 'undefined' || typeof this.state.leaveBalance.chBalance === 'undefined' || this.state.leaveBalance.chBalance == 0) {
            isValid = false;
        }

        return isValid;
    }

    render() {
        let isValid = this.isValid();
        return (
            <>
                <Modal size="lg" show={this.state.show} onHide={this.handleClose} className="applyLeaveModal">
                    <Modal.Header closeButton>
                        <Modal.Title>Apply Choice Holiday</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <div class="form-group choiceHolidayGroup">
                                <label class="control-label col-sm-3" for="holidayDate">Holiday Name:</label>
                                <div class="col-sm-9 select">
                                    <input readOnly class="form-control" value={typeof this.state.details.name !== 'undefined' ? this.state.details.name : "NA"} />
                                </div>
                            </div>
                            <div class="form-group choiceHolidayGroup">
                                <label class="control-label col-sm-3" for="holidayDate">Holiday Date:</label>
                                <div class="col-sm-9 select">
                                    <input readOnly class="form-control" value={typeof this.state.details.date !== 'undefined' ? moment(this.state.details.date).format("ll") : "NA"} />
                                </div>
                            </div>
                            <div class="form-group leaveBalance">
                                <label class="control-label col-sm-3" for="leaveBalance">Leave Balance:</label>
                                <div class="col-sm-9">
                                    <input readOnly class="form-control" value={this.state.leaveBalance.chBalance} />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="control-label col-sm-3" for="comment">Comment:</label>
                                <div class="col-sm-9">
                                    <Form.Control as="textarea" rows="3" value={this.state.comment} onChange={this.handleChange.bind(this)} />
                                </div>
                            </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={this.handleClose} onClick={this.onSubmit} disabled={!isValid || this.state.btnDisable}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </Modal>

            </>
        )
    }
}

export default HolidayList;