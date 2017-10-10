
import React from "react"

import { DropdownButton, MenuItem, ButtonGroup, Button, Modal, ListGroup, ListGroupItem } from "react-bootstrap"

import Encoder from "./encoder"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/albumpopup.css");
}

/**
 * Component for album specification upon upload
 */
class AlbumPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = props;

        this.albumSelected = this.albumSelected.bind(this);
        this.confirmUpload = this.confirmUpload.bind(this);
        this.cancelUpload = this.cancelUpload.bind(this);
        this.saveUploadData = this.saveUploadData.bind(this);
    }

    componentDidMount() {
        this.state.albumPopUpMounted(this.refs["album-pop-up"]);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }

    /**
     * Called when the user selects a target album for upload
     * @param {*} albumName the name of the album selected by the user
     */
    albumSelected(albumName) {
        this.setState({selectedAlbum: albumName});
    }

    /**
     * Uploads the image to the database and calls the callback notifying the parent component
     */
    confirmUpload() {
        if (this.state.selectedAlbum == undefined) {
            alert("Please select a target album before confirming the image upload.");
            return;
        }

        // upload raw file
        var XMLHttp = new XMLHttpRequest();
        var url = "/edit/upload";
        XMLHttp.open("POST", url, true);

        XMLHttp.onreadystatechange = function() {
            if(XMLHttp.readyState == 4 && XMLHttp.status == 200) {
                this.state.uploadConfirmed(Encoder.decodeKey(XMLHttp.responseText), this.state.selectedAlbum);
            }
        }.bind(this);

        var formData = new FormData();
        formData.append("file", this.state.currentImage);
        formData.append("editHistory", this.state.editHistory);
        formData.append("albumName", this.state.selectedAlbum);
        XMLHttp.send(formData);
    }

      /**
   * Saves a newly uploaded image to it's appropriate album in the database
   * @param {*} imageName the name of the image being saved
   * @param {*} base64Image the base64 version of the image
   * @param {*} imageEditHistory the edit history of the image
   * @param {*} destinationAlbum the album to which the image belongs
   */
  saveUploadData(imageName, base64Image, imageEditHistory, destinationAlbum, uploadCallback) {
        if (imageName === undefined) {
            return;
        }

        var payload = {
            imageFileName: imageName,
            imageSource: base64Image,
            editHistory: imageEditHistory,
            albumName: destinationAlbum
        };

        var http = new XMLHttpRequest();
        var url = "edit/upload";
        http.open("POST", url, true);

        http.setRequestHeader("Content-Type", "application/json");
        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                uploadCallback(Encoder.decodeKey(http.responseText), destinationAlbum);
            }
        };

        http.send(JSON.stringify(payload));
    }

    /**
     * Cancels the scheduled image upload.
     */
    cancelUpload() {
        this.state.uploadCancelled();
    }

    render() {
        var menuTitle = this.state.selectedAlbum === undefined ? "Album" : this.state.selectedAlbum;
        var albumDisplay = this.state.selectedAlbum === undefined ? "" : "--> " + this.state.selectedAlbum;

        return (
            <Modal className="static-modal" show={this.state.showModal} onHide={this.cancelUpload}>
                <Modal.Header className="modal-header">
                    <Modal.Title>Select the desired album for the photo. </Modal.Title>
                </Modal.Header>

                <Modal.Body className="modal-body">
                    <ListGroup className="album-options">
                        {this.props.albumNames.map(function(albumName) {
                            if (albumName != "All Photos") {
                                return <ListGroupItem onClick={() => this.albumSelected(albumName)}> {albumName} </ListGroupItem>
                            }
                        }, this)}
                    </ListGroup>
                </Modal.Body>

                <Modal.Footer className="modal-footer">
                    <Button onClick={() => this.cancelUpload()}> Cancel </Button>
                    <Button onClick={() => this.confirmUpload()}> Confirm Upload </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default AlbumPopUp;