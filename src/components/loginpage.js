import React from "react"

import { FormControl, Button } from "react-bootstrap"
import { Link } from "react-router-dom"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/loginpage.css");
}

/**
 * Component which serves as the login page for the application
 */
class LoginPage extends React.Component {

    constructor(props) {
        super(props);

        console.log(props);

        this.state = {
            email: "",
            password: "",
            history: this.props.history
        };

        this.login = this.login.bind(this);
        this.characterEntered = this.characterEntered.bind(this);
    }

    /**
     * Called when the user submits the entered info to log in
     */
    login() {
        var email = this.refs["email-field"].props.value;
        var password = this.refs["password-field"].props.value;

        var payload = {
            username: email,
            password: password
        };

        var url = "/login";
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");

        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4) {
                if (xmlHttp.status === 200) {
                    this.props.auth.loginComplete();
                    this.state.history.goBack();
                } else {
                    this.state.history.push("/login");
                }
            }
        }.bind(this);
        xmlHttp.send(JSON.stringify(payload));
    }

    /**
     * Updates the respective state when the user enters a character in the form
     * @param {*} e the event of the character entry
     */
    characterEntered(e) {
        var formType = e.target.placeholder;
        if (formType === "Email") {
            this.setState({email: e.target.value});
        } else {
            this.setState({password: e.target.value});
        }
    }

    render() {
        return (
            <div className="login-root-div">
                <div className="name-title-div">
                    <span className="name-title"> SmartPhoto </span>
                </div>
                <hr className="thin-line" />
                <div className="login-forms">
                    <span className="email-address-title"> Log in with your email address </span>
                    <form className="loginForm">
                        <FormControl className="info-field" ref="email-field" type="email" placeholder="Email" value={this.state.email} onChange={this.characterEntered}/>
                        <FormControl className="info-field" ref="password-field" type="password" placeholder="Password" value={this.state.password} onChange={this.characterEntered}/>
                        <Button className="submitButton" onClick={() => this.login()}> Log In </Button>
                    </form>
                    <div className="forgot-div">
                        <Link className="forgot-link" to="/password-reset"> Forgot your username or password? </Link>
                    </div>
                    <div className="signup-prompt-div">
                        <span className="signup-prompt"> Don't have an account? </span>
                        <Link className="signup-link" to="/signup"> Sign Up </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginPage;