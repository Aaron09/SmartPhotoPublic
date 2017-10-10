import React from "react"

import { Button } from "react-bootstrap"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/logoutpage.css");
}

/**
 * Component which serves as the page from which users log out
 */
class LogoutPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            history: this.props.history
        }

        this.logout = this.logout.bind(this);
    }

    /**
     * Called when the user clicks the log out button
     */
    logout() {
        var url = "/logout";
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("POST", url, true);
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                this.props.auth.logoutComplete();
                this.state.history.push("/home");
            }
        }.bind(this);
        xmlHttp.send(null);
    }

    render() {
        return (
            <div className="logout-root-div">
                <div className="name-title-div">
                    <span className="name-title"> SmartPhoto </span>
                </div>
                <hr className="thin-line" />
                <div className="logout-main-div">
                    <div className="farewell-message-div">
                        <span className="farewell-message"> Thank you for using SmartPhoto </span>
                    </div>
                    <div className="logout-forms-div">
                        <Button className="logout-button" onClick={this.logout}> Log Out </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default LogoutPage;