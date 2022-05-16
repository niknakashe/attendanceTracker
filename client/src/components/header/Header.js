import React from "react";
import { NavLink } from "react-router-dom";
import '../header/Header.css';
import $ from 'jquery';
import '../../assets/css/linearicons.css';
var jwt = require('jsonwebtoken');
const config = require('../../config/config');

class Header extends React.Component {
    constructor(props) {
        super(props);

        let userDetails = localStorage.getItem("token");
        if (userDetails != null) {
            userDetails = jwt.decode(userDetails, config.JWT_SECRET);
        }

        this.state = {
            'userDetails': userDetails
        }

        this.logoutClick = this.logoutClick.bind(this);
    }

    logoutClick() {
        localStorage.clear();
        window.location.reload();
    }

    componentDidMount() {
        if ($('#nav-menu-container').length) {
            var $mobile_nav = $('#nav-menu-container').clone().prop({
                id: 'mobile-nav'
            });
            $mobile_nav.find('> ul').attr({
                'class': '',
                'id': ''
            });
            $('body').append($mobile_nav);
            $('body').prepend('<button type="button" id="mobile-nav-toggle"><i class="lnr lnr-menu"></i></button>');
            $('body').append('<div id="mobile-body-overly"></div>');
            $('#mobile-nav').find('.menu-has-children').prepend('<i class="lnr lnr-chevron-down"></i>');

            $(document).on('click', '.menu-has-children i', function (e) {
                $(this).next().toggleClass('menu-item-active');
                $(this).nextAll('ul').eq(0).slideToggle();
                $(this).toggleClass("lnr-chevron-up lnr-chevron-down");
            });

            $(document).on('click', '#mobile-nav-toggle', function (e) {
                $('body').toggleClass('mobile-nav-active');
                $('#mobile-nav-toggle i').toggleClass('lnr-cross lnr-menu');
                $('#mobile-body-overly').toggle();
            });

            $(document).on('click', function (e) {
                var container = $("#mobile-nav, #mobile-nav-toggle");
                if (!container.is(e.target) && container.has(e.target).length === 0) {
                    if ($('body').hasClass('mobile-nav-active')) {
                        $('body').removeClass('mobile-nav-active');
                        $('#mobile-nav-toggle i').toggleClass('lnr-cross lnr-menu');
                        $('#mobile-body-overly').fadeOut();
                    }
                }
            });
        } else if ($("#mobile-nav, #mobile-nav-toggle").length) {
            $("#mobile-nav, #mobile-nav-toggle").hide();
        }
    }

    render() {
        return (
            <header id="header">
                <div className="container main-menu">
                    <div className="row align-items-center d-flex">
                        <div id="logo">
                            <a href="index.html"><img src="/images/gmi_logo.png" alt="" title="" /></a>
                        </div>
                        <nav id="nav-menu-container">
                            <ul className="nav-menu">
                                <li>
                                    <NavLink to="/dashboard" activeClassName="menu-active">Home</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/leave" activeClassName="menu-active">Leave</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/holiday-list" activeClassName="menu-active">Holiday List</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/task-list" activeClassName="menu-active">Today's Task</NavLink>
                                </li>
                                {
                                    typeof this.state.userDetails.userType !== 'undefined' && this.state.userDetails.userType == 2
                                        ?
                                        <li class="menu-has-children">
                                            <NavLink to="/requests" activeClassName="menu-active">Admin Options</NavLink>
                                            <ul>
                                                <li>
                                                    <NavLink to="/requests" activeClassName="menu-active">Requests</NavLink>
                                                </li>
                                                <li>
                                                    <NavLink to="/report" activeClassName="menu-active">Reports</NavLink>
                                                </li>
                                            </ul>
                                        </li>
                                        :
                                        ""
                                }

                            </ul>
                        </nav>
                    </div>
                    <div className="row align-items-right hidden-xs hidden-sm">
                        <div className="shortProfileInfo">
                            <div className="childDiv">
                                <div className="profileDropdown">
                                    <div className="dropdown">
                                        <button className="dropbtn">
                                            {
                                                typeof this.state.userDetails.name !== 'undefined' && this.state.userDetails.name != null && this.state.userDetails.name !== ""
                                                    ?
                                                    this.state.userDetails.name
                                                    :
                                                    "User"
                                            }
                                            <i className="fa fa-angle-down"></i></button>
                                        <div className="dropdown-content">
                                            <a onClick={this.logoutClick}>Logout</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="profileImg">
                                    {
                                        typeof this.state.userDetails.profilePic !== 'undefined' && this.state.userDetails.profilePic != null && this.state.userDetails.profilePic !== ""
                                            ?
                                            <img src={this.state.userDetails.profilePic} width="24px" />
                                            :
                                            <img src="/images/user-test.jpg" width="24px" />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        )
    }
}

export default Header;