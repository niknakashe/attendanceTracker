import React from 'react';
import { Route, Redirect } from 'react-router-dom';
var jwt = require('jsonwebtoken');
const config = require('../config/config');

export const PrivateRouteAdmin = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => {
        let token = localStorage.getItem("token");

        //Check if Logged IN
        let isLoggedIn = jwt.verify(token, config.JWT_SECRET, function (err, tokenDecode) {
            if (err) {
                return false;
            }
            else if (typeof tokenDecode.email !== 'undefined') {
                return true;
            }
        });

        //Check user is Admin userType 1. Normal User 2. Admin
        let isAdmin = jwt.verify(token, config.JWT_SECRET, function (err, tokenDecode) {
            if (err) {
                return false;
            }
            else if (typeof tokenDecode.userType !== 'undefined' && tokenDecode.userType == 2) {
                return true;
            }
            else {
                return false;
            }
        });

        if (!isLoggedIn) {
            return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        }
        else if (!isAdmin) {
            return <Redirect to={{ pathname: '/dashboard', state: { from: props.location } }} />
        }

        return <Component {...props} />
    }} />
)