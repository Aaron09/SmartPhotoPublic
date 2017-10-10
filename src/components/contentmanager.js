
import React from "react"
import { Button, DropdownButton, MenuItem, Well } from "react-bootstrap"

import DropUpload from "./dropupload"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/contentmanager.css");
}

/**
 * Component for uploading and content management on the storage page
 */
export default class ContentManager extends React.Component {
    constructor(props) {
        super(props);

        this.state = props;

        this.albumSelected = this.albumSelected.bind(this);
        this.createAlbumPopUp = this.createAlbumPopUp.bind(this);
        this.deleteAlbumPopUp = this.deleteAlbumPopUp.bind(this);
        this.deletePhotosPopUp = this.deletePhotosPopUp.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.state = nextProps;
    }

    /**
     * Called when the user selects a target album for uploading
     * @param {*} albumName the name of the selected target album
     */
    albumSelected(albumName) {
        this.state.uploadTargetSelected(albumName);
    }

    /**
     * Called when the user clicks a button to begin creating an album
     */
    createAlbumPopUp() {
        this.state.createAlbumPrompt();
    }

    /**
     * Called when the user clicks a button to begin deleting an album
     */
    deleteAlbumPopUp() {
        this.props.albumDeletionPrompt();
    }

    /**
     * Called when the user clicks a button to begin deleting photos
     */
    deletePhotosPopUp() {
        this.props.photoDeletionPrompt();
    }

    render() {
        return (
            <div className="content-manager-div">
                <div className="management-buttons">
                    <Button className="create-album-button" onClick={this.createAlbumPopUp}> Create an Album </Button>
                    <Button className="delete-album-button" onClick={this.deleteAlbumPopUp}> Delete an Album </Button>
                    <Button className="delete-photos-button" onClick={this.deletePhotosPopUp}> Delete Selected Photos </Button>
                </div>
                <div className="upload-target-div">
                    <Well>
                        <span className="target-label"> Upload to which album? </span>
                        <DropdownButton title={this.state.uploadTargetAlbum} className="album-dropdown-button">
                            {this.props.albumNames.map(function(albumName) {
                                if (albumName !== "All Photos") {
                                    return <MenuItem active={albumName === this.state.uploadTargetAlbum} ref={albumName} key={albumName} className="album-item" onClick={() => this.albumSelected(albumName)}> {albumName} </MenuItem>
                                }
                            }, this)}
                        </DropdownButton>
                    </Well>
                    <DropUpload className="drop-upload" uploadCallback={this.props.dropUploadOccured} targetAlbum={this.state.uploadTargetAlbum} />
                </div>
            </div>
        );
    }
}