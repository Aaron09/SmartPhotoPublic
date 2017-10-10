import React from "react"

import { FormControl, Button } from "react-bootstrap"
import { Link } from "react-router-dom"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/signuppage.css");
}

/**
 * Component which serves as the main page for user registration
 */
class SignUpPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            confirmEmail: "",
            password: "",
            history: this.props.history
        };

        this.createAccount = this.createAccount.bind(this);
        this.characterEntered = this.characterEntered.bind(this);
    }

    /**
     * Called when the user submits the entered info to create their account
     */
    createAccount() {
        var email = this.refs["email-field"].props.value;
        var password = this.refs["password-field"].props.value;
        var confirmPassword = this.refs["password-confirmation-field"].props.value;

        if (password != confirmPassword) {
            console.log('Passwords do not match.');
            return;
        }

        var payload = {
            username: email,
            password: password
        };

        var url = "/signup";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");

        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4) {
                if (xmlHttp.status === 200) {
                    this.props.auth.loginComplete();
                    this.state.history.push("/edit");
                } else {
                    this.state.history.push("/signup");
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
        } else if (formType === "Confirm Password") {
            this.setState({confirmPassword: e.target.value});
        } else {
            this.setState({password: e.target.value});
        }
    }

    render() {
        return (
            <div className="signup-root-div">
                <div className="name-title-div">
                    <span className="name-title"> SmartPhoto </span>
                </div>
                <hr className="thin-line" />
                <div className="signup-forms">
                    <span className="email-address-title"> Sign up with your email address </span>
                    <form className="signupInfoForm">
                        <FormControl className="info-field" ref="email-field" type="email" placeholder="Email" value={this.state.email} onChange={this.characterEntered}/>
                        <FormControl className="info-field" ref="password-field" type="password" placeholder="Password" value={this.state.password} onChange={this.characterEntered}/>
                        <FormControl className="info-field" ref="password-confirmation-field" type="password" placeholder="Confirm Password" value={this.state.confirmPassword} onChange={this.characterEntered}/>
                        <Button className="submitButton" onClick={() => this.createAccount()}> Sign Up </Button>
                    </form>
                    <div className="login-prompt-div">
                        <span className="login-prompt"> Already have an account? </span>
                        <Link className="login-link" to="/login"> Log In </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default SignUpPage;