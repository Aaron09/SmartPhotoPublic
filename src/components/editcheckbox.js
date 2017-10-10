import React from "react"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/editcheckbox.css");
}

/**
 * Component for making image changes using a checkbox
 */
class EditCheckbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = props;

        this.checkboxClicked = this.checkboxClicked.bind(this);
    }

    checkboxClicked() {
        this.state.checkMade(this.refs["checkbox-box"].value);
    }

    render() {
        var displayName = "Invalid Checkbox Type";
        if (this.state.checkboxName === "redEye") {
            displayName = "Fix Red Eye";
        } else if (this.state.checkboxName === "invert") {
            displayName = "Invert";
        } else if (this.state.checkboxName === "teethWhiten") {
            displayName = "Whiten Teeth";
        }

        return (
            <div className="checkbox-item">
                <input ref="checkbox-box" onChange={this.checkboxClicked} value={this.state.checkboxName} type="checkbox" className="checkbox-box" />
                <span className="checkboxName"> {displayName} </span>
            </div>
        );
    }
}

export default EditCheckbox;