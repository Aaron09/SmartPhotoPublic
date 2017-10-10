import React from "react"

import { Modal, Button, Well, FormControl } from "react-bootstrap"

import Encoder from "./encoder"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/deletealbumpopup.css");
}

/**
 * Component for album deletion pop up
 */
export default class DeleteAlbumPopUp extends React.Component {
    constructor(props) {
        super(props);

        this.state = props;

        this.deleteAlbum = this.deleteAlbum.bind(this);
        this.cancelDeletion = this.cancelDeletion.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleConfirmNameChange = this.handleConfirmNameChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }

    /**
     * Called when the user presses the button to confirm album deletion
     */
    deleteAlbum() {
        if (this.state.albumName === this.state.confirmAlbumName) {
            var payload = {
                albumName: this.state.albumName
            }

            var url = "/storage/album/delete";
            var xmlHttp = new XMLHttpRequest();

            xmlHttp.open("POST", url, true);
            xmlHttp.setRequestHeader("Content-Type", "application/json");

            xmlHttp.onreadystatechange = function() {
                if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    this.props.deleteAlbumDecisionComplete(this.state.albumName);
                }
            }.bind(this);
            xmlHttp.send(JSON.stringify(payload));
        } else {
            this.props.deleteAlbumDecisionComplete('Album names do not match.');
        }
    }

    /**
     * Called when the user cancels the album deletion process
     */
    cancelDeletion() {
        this.props.deleteAlbumDecisionComplete();
    }

    /**
     * Called when the user enters a value in the album name form
     * @param {*} event album name change event
     */
    handleNameChange(event) {
        this.setState({albumName: event.target.value});
    }

    /**
     * Called when the user enters a value in the confirm album name form
     * @param {*} event confirm album name change event
     */
    handleConfirmNameChange(event) {    
        this.setState({confirmAlbumName: event.target.value});
    }

    render() {
        return (
            <Modal show={this.props.showAlbumDeletionModal} onHide={this.cancelDeletion} className="photo-deletion-modal">
                <Modal.Header>
                    <Modal.Title> Enter the name of the album you wish to delete. </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Well> WARNING: The following action will PERMANENTLY delete all photos within the album. </Well>
                    <FormControl
                        type="text"
                        value={this.state.albumName}
                        placeholder="Album name here"
                        onChange={this.handleNameChange}
                    /> 
                    <FormControl
                        type="text"
                        value={this.state.confirmAlbumName}
                        placeholder="Confirm album name here"
                        onChange={this.handleConfirmNameChange}
                    />
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={() => this.cancelDeletion()}> Cancel </Button>
                    <Button onClick={() => this.deleteAlbum()}> Delete Album </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}