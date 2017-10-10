import React from "react"
import UploadButton from "./uploadbutton"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/managementpanel.css");
}

/**
 * Component which houses the store and upload buttons
 */
class ManagementPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = props;
    }

    componentWillReceiveProps(nextProps) {
        this.state = nextProps;
    }
    
    render() {
        return (
            <div className="management-panel">
                <UploadButton {...this.state} className="upload-button"/>
                <a href={this.state.currentImageURL} download={this.state.currentImageURL} >
                    <img src="/img/download_symbol.jpg" alt="" className="download-button" />
                </a>
            </div>
        );
    }
}

export default ManagementPanel;