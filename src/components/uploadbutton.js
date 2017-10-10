import React from "react"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/uploadbutton.css");
}

/**
 * Component which allows the user to upload a file to edit
 */
class UploadButton extends React.Component {

    constructor(props) {
        super(props);
        this.state = props;
    }

    /**
     * Opens the file selection form, allowing the user to upload a file
     */
    uploadFile() {
        this.refs["file-upload"].click();
    }

    /**
     * Triggered when the user selects a file for upload or hits cancel
     */
    fileUploaded(event) {
        if (event.target.files.length === 0) {
            return;
        }
        var imageFile = event.target.files[0];
        
        // make album selector appear here
        var albumPopUp = this.state.albumPopUpPanel;
        
        this.props.handleFileUpload(imageFile);
    }

    render() {
        return (
            <div className="upload-div">
                <img src="/img/cloud_upload_symbol.jpg" alt="" className="upload-button" onClick={this.uploadFile.bind(this)} /> 
                <input type="file" accept="image/*" id="file-upload" ref="file-upload" onChange={this.fileUploaded.bind(this)}/>
            </div>      
        );
    }
}

export default UploadButton;