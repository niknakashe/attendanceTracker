import React from 'react';
import Header from '../header/Header';
import $ from 'jquery';
import Axios from 'axios';
import '../taskList/TaskList.css';
import moment from 'moment';
const config = require('../../config/config');

class TaskList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            taskList: []
        }

        this.getTaskList = this.getTaskList.bind(this);
        this.prepareTableData = this.prepareTableData.bind(this);
        this.fixedFirstColumnForMobile = this.fixedFirstColumnForMobile.bind(this);
    }

    componentWillMount() {
        this.getTaskList();        
    }

    getTaskList() {
        let that = this;
        Axios.post(config.API_BASE + "/user/getUserAttendance", {
            'attendanceDate': moment().format(config.API_DATE_FORMAT)
        })
            .then(function (response) {
                let res = response.data;
                if (res.status) {
                    let calenderData = typeof res.data !== 'undefined' ? res.data : [];
                    that.setState({ 'taskList': calenderData }, that.fixedFirstColumnForMobile);
                }
            })
            .catch(function (error) {
                console.log('error', error);
            })
    }

    fixedFirstColumnForMobile() {
        var $table = $('.table');
        var $fixedColumn = $table.clone().insertBefore($table).addClass('fixed-column');

        $fixedColumn.find('th:not(:first-child),td:not(:first-child)').remove();

        $fixedColumn.find('tr').each(function (i, elem) {
            $(this).height($table.find('tr:eq(' + i + ')').height());
        });
    }

    prepareTableData() {
        let taskList = this.state.taskList;
        let rows = [];

        taskList.map(function (value, index) {
            rows.push(
                <tr key={index}>
                    <td>{value.name}</td>
                    <td>{value.statusName}</td>
                    <td className="taskForDay">{value.taskForDay}</td>
                    <td className="additionalNote">{value.additionalNote != '' && value.additionalNote != null ? value.additionalNote : "NA"}</td>
                    <td>{moment(value.attendanceDate).format("Do MMMM YYYY")}</td>
                </tr>
            )
        });

        return rows;
    }

    render() {
        let tableRows = this.prepareTableData();
        return (
            <>
                <Header />
                <div className="container-fluid">
                    <div className="row taskListMain">
                        <div className="col-xs-12">
                            <div className="card">
                                <div className="titleText">Task for {moment().format("Do MMMM YYYY")}</div>
                                {
                                    this.state.taskList.length == 0
                                        ?
                                        <h3>No Record Found</h3>
                                        :
                                        <div className="table-responsive">
                                            <table className="table table-striped table-bordered table-hover table-condensed">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Status</th>
                                                        <th>Task</th>
                                                        <th>Additional Notes</th>
                                                        <th>Inserted Date</th>
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
            </>
        )
    }
}

export default TaskList;