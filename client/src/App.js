import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Login from  '../src/components/login/Login';
import Dashboard from '../src/components/dashboard/Dashboard';
import { PrivateRoute } from '../src/components/PrivateRoute';
import { PrivateRouteAdmin } from '../src/components/PrivateRouteAdmin';
import HolidayList from '../src/components/holidayList/HolidayList';
import TaskList from '../src/components/taskList/TaskList';
import Leave from '../src/components/leave/Leave';
import AttendanceRequest from '../src/components/attendanceRequest/Request';
import Report from '../src/components/attendanceReport/Report';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
            <PrivateRoute exact path="/" component={Dashboard} />
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <PrivateRoute exact path="/holiday-list" component={HolidayList} />
            <PrivateRoute exact path="/task-list" component={TaskList} />
            <PrivateRoute exact path="/leave" component={Leave} />
            <PrivateRouteAdmin exact path="/report" component={Report} />
            <PrivateRouteAdmin exact path="/requests" component={AttendanceRequest} />
            <Route path="/login" component={Login} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
