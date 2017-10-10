
import React from "react"
import DropzoneComponent from 'react-dropzone-component';

"use strict";

if (process.env.BROWSER) {
    require("../static/css/dropupload.css");
    require("../../node_modules/react-dropzone-component/styles/filepicker.css");
    require("../../node_modules/dropzone/dist/min/dropzone.min.css");
}

/**
 * Component for drop zone uploading
 */
export default class DropUpload extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            componentConfig: {
                iconFiletypes: ['.jpg', '.png'],
                showFiletypeIcon: true,
                postUrl: '/dropupload/' + props.targetAlbum
            }, djsConfig: { 
                uploadMultiple: true 
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.state = {
            componentConfig: {
                iconFiletypes: ['.jpg', '.png'],
                showFiletypeIcon: true,
                postUrl: '/dropupload/' + nextProps.targetAlbum
            }, djsConfig: {
                uploadMultiple: true
            }
        }
    }

    render() {
        var eventHandlers = {
            queuecomplete: () => this.props.uploadCallback(this.props.targetAlbum)
        }

        return (
            <div className="dropzone-div">
                <DropzoneComponent className="dropzone-component" config={this.state.componentConfig} eventHandlers={eventHandlers} djsConfig={this.state.djsConfig} />
            </div>
        );
    }
}