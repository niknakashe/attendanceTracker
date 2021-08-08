import React from 'react';
import { Route, Redirect } from 'react-router-dom';
var jwt = require('jsonwebtoken');
const config = require('../config/config');

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => {
        let token = localStorage.getItem("token");
        
        let isLoggedIn = jwt.verify(token, config.JWT_SECRET, function (err, tokenDecode) {
            if(err) {
                return false;
            }
            else if(typeof tokenDecode.email !== 'undefined') {
                return true;
            }
        });
        if (!isLoggedIn) {
            return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        }

        return <Component {...props} />
    }} />
)