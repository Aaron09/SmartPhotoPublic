
import React from "react"

import { ControlLabel, FormControl, Button, ButtonGroup, Modal } from "react-bootstrap"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/createalbum.css");
}

/**
 * Component for allowing the user to create a new album
 */
class CreateAlbum extends React.Component {

    constructor(props) {
        super(props);
        this.state = props;

        this.createAlbum = this.createAlbum.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.cancelCreation = this.cancelCreation.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.state = nextProps;
    }

    /**
     * Confirms the creation of the user's album
     */
    createAlbum() {
        this.state.albumModalFinished();

        var newAlbumName = this.state.value;

        if (newAlbumName == null || newAlbumName === undefined || newAlbumName === "") {
            return;
        }

        // make post request to server with new album name
        var payload = {
            albumName: newAlbumName
        };

        var url = "/create/album";
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");

        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                this.state.albumCreated(newAlbumName);
            }
        }.bind(this);
        xmlHttp.send(JSON.stringify(payload));
    }

    /**
     * Cancels the album creation popup
     */
    cancelCreation() {
        this.state.albumModalFinished();
    }

    /**
     * Tracks user album name as they type
     * @param {*} event user typing event
     */
    handleChange(event) {
        this.setState({value: event.target.value});
    }

    render() {
        return (
            <Modal show={this.state.showAlbumCreationModal} onHide={this.cancelCreation} className="album-creation-modal">
                <Modal.Header>
                    <Modal.Title> Enter the name of the new album. </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <FormControl
                        type="text"
                        value={this.state.value}
                        placeholder="Album name here"
                        onChange={this.handleChange}
                    /> 
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={() => this.cancelCreation()}> Cancel </Button>
                    <Button onClick={() => this.createAlbum()}> Create </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default CreateAlbum;