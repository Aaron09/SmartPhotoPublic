import React from "react"

import { Modal, Button } from "react-bootstrap"

import Encoder from "./encoder"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/deletephotospopup.css");
}

/**
 * Modal for confirming photo deletion
 */
export default class DeletePhotosPopUp extends React.Component {
    constructor(props) {
        super(props);
    
        this.state = {
            photoURLs: Object.keys(props.selectedPhotos)
        }

        this.deletePhotos = this.deletePhotos.bind(this);
        this.cancelDeletion = this.cancelDeletion.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.state = {
            photoURLs: Object.keys(nextProps.selectedPhotos)
        }
    }

    /**
     * Called when the user confirms photo deletion
     * Deletes the photos from the database and builds the list of 
     * modified albums to be refreshed. Hides the modal.
     */
    deletePhotos() {
        var modifiedAlbums = ['All Photos'];
        
        for (var key in this.state.photoURLs) {
            var photoURL = this.state.photoURLs[key];

            // add album to modified albums list
            modifiedAlbums.push(this.props.albums["All Photos"][Encoder.encodeKey(photoURL)].parentAlbum);
        }
        var payload = {
            photos: this.state.photoURLs
        }

        var url = "/storage/photos/delete";
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");

        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                // update the modified albums
                this.props.deletePhotosDecisionComplete(modifiedAlbums);
            }
        }.bind(this);
        xmlHttp.send(JSON.stringify(payload));
    }

    /**
     * Called when the user cancels photo deletion. Hides the modal.
     */
    cancelDeletion() {
        var modifiedAlbums = [];
        this.props.deletePhotosDecisionComplete(modifiedAlbums);
    }

    render() {

        return (
             <Modal show={this.props.showPhotoDeletionModal} onHide={this.cancelDeletion} className="photo-deletion-modal">
                <Modal.Header>
                    <Modal.Title> Are you sure you want to delete the selected {this.state.photoURLs.length} photo(s)? </Modal.Title>
                </Modal.Header>

                <Modal.Footer>
                    <Button onClick={() => this.cancelDeletion()}> Cancel </Button>
                    <Button onClick={() => this.deletePhotos()}> Delete Photos </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}