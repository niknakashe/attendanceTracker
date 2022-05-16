import React from 'react';
import './Login.css';
import { GoogleLogin } from 'react-google-login';
import { withRouter } from 'react-router-dom';
import Axios from 'axios';
import $ from 'jquery';
const config = require('../../config/config');
var jwt = require('jsonwebtoken');

class Login extends React.Component {
    constructor(props) {
        super(props);

        let token = localStorage.getItem("token");
        //If already logged in than redirect to dashboard
        jwt.verify(token, config.JWT_SECRET, function (err, tokenDecode) {
            if(err) {
                return false;
            }
            else if(typeof tokenDecode.email !== 'undefined') {
                props.history.push('/dashboard');
            }
        });

        this.onSuccessLogin = this.onSuccessLogin.bind(this);
        this.onFailLogin = this.onFailLogin.bind(this);
        this.updateUserDetails = this.updateUserDetails.bind(this);
    }

    onSuccessLogin(response) {
        if (typeof response.profileObj == 'undefined') {
            return false;
        }

        let that = this;
        let profileInfo = response.profileObj;
        console.log('response', profileInfo);
        Axios.post(config.API_BASE + "/user/isUserExist", { 'email': profileInfo.email })
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    let userData = response.data[0];

                    if (typeof userData.name === 'undefined' || userData.name == "" || userData.name == null || typeof userData.profilePic === 'undefined' || userData.profilePic == "" || userData.profilePic == null) {
                        let updateData = {
                            'name': profileInfo.name,
                            'profilePic': profileInfo.imageUrl,
                            'userId': userData.id
                        }
                        that.updateUserDetails(updateData, userData);
                    }
                    else {
                        //Store Token into local storage
                        let jwtToken = jwt.sign(response.data[0], config.JWT_SECRET, { expiresIn: '2h' });
                        localStorage.setItem("token", jwtToken);
                        that.props.history.push('/dashboard');
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    updateUserDetails(updateData, userData) {
        let that = this;
        Axios.post(config.API_BASE + "/user/updateUserDetails", updateData)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.status) {
                    //Store Token into local storage
                    let finalUserData = userData;
                    finalUserData.profilePic = updateData.profilePic;
                    finalUserData.name = updateData.name;

                    let jwtToken = jwt.sign(finalUserData, config.JWT_SECRET, { expiresIn: '2h' });
                    localStorage.setItem("token", jwtToken);
                    that.props.history.push('/dashboard');
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    onFailLogin() {
        alert("Something went wrong. Please try again");
    }

    getLoginButtonHtml(renderProps) {
        return (
            <div className="abcRioButton abcRioButtonBlue" onClick={renderProps.onClick} disabled={renderProps.disabled}>
                <div className="abcRioButtonContentWrapper">
                    <div className="abcRioButtonIcon">
                        <div className="abcRioButtonSvgImageWithFallback abcRioButtonIconImage abcRioButtonIconImage18">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 48 48" className="abcRioButtonSvg">
                                <g>
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                    <path fill="none" d="M0 0h48v48H0z"></path>
                                </g>
                            </svg>
                        </div>
                    </div>
                    <span className="abcRioButtonContents">
                        <span id="not_signed_ino9lrh9f84cf8">Login with Google</span></span>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="limiter">
                <div className="container-login100">
                    <div className="wrap-login100 p-l-85 p-r-85 p-t-55 p-b-55">
                        <form className="login100-form validate-form flex-sb flex-w">
                            <span className="gmiLogo">
                                <img src="/images/gmi_logo.png" />
                            </span>
                            <span className="login100-form-title p-b-32">
                                Attendance Tracker Login
                            </span>
                            <GoogleLogin
                                clientId={config.GOOGLE_KEY}
                                render={renderProps => (
                                    this.getLoginButtonHtml(renderProps)
                                )}
                                buttonText="Login"
                                onSuccess={this.onSuccessLogin}
                                onFailure={this.onFailLogin}
                                cookiePolicy={'single_host_origin'}
                            />
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Login);