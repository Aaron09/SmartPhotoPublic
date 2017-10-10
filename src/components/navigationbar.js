import React from "react"

import { Link } from "react-router-dom"
import { Nav, NavItem } from "react-bootstrap"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/navigationbar.css");
}

/**
 * Component that serves as a navigation bar for the application
 */
class NavigationBar extends React.Component {
    render() {   
        if (this.props.auth.isLoggedIn()) {
            return (
                <Nav className="navigationBar">
                    <div className="titleButton">
                        <Link to="/home"> SmartPhoto </Link>
                    </div>
                    <div className="pageButtons">
                        <Link to="/storage"> Storage </Link>
                        <Link to="/edit"> Edit </Link>
                        <Link to="/logout"> Log Out </Link>
                    </div>
                </Nav>
            );
        } else {
             return (
                <Nav className="navigationBar">
                    <div className="titleButton">
                        <Link to="/home"> SmartPhoto </Link>
                    </div>
                    <div className="pageButtons">
                        <Link to="/storage"> Storage </Link>
                        <Link to="/edit"> Edit </Link>
                        <Link to="/signup"> Sign Up </Link>
                        <Link to="/login"> Log In </Link>
                    </div>
                </Nav>
            );
        }
    } 
}

export default NavigationBar;