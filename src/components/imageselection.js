import React from "react"

import ImageHint from "./imagehint"
import CreateAlbum from "./createalbum"

import { ButtonGroup, Button, DropdownButton, MenuItem } from "react-bootstrap"

import Encoder from "./encoder"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/imageselection.css");
}

/**
 * Component which houses album selection and image hint display
 */
class ImageSelection extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showAlbumCreationModal: false,
            albumCreator: undefined            
        };

        this.albumSelected = this.albumSelected.bind(this);
        this.createAlbumPrompt = this.createAlbumPrompt.bind(this);
        this.albumModalFinished = this.albumModalFinished.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        /* Only needed so component will update with new props */
    }

    /**
     * Sets the current album with the one the user selected
     * @param {*} album the album selected by the user
     */
    albumSelected(albumName) {
        this.props.albumSelectionCallback(albumName);
    }

    /**
     * Displays the album creator on the create button click
     */
    createAlbumPrompt() {
        this.setState({showAlbumCreationModal: true});
    }

    /**
     * Hides the album creator on completion
     */
    albumModalFinished() {
        this.setState({showAlbumCreationModal: false});
    }

    render() {
        var createAlbumProps = {
            albumCreated: this.props.albumCreated,
            showAlbumCreationModal: this.state.showAlbumCreationModal,
            albumModalFinished: this.albumModalFinished
        };

        return (
            <div className="image-selection-master">
                <div className="image-selection">
                    <div className="album-management">
                        <ButtonGroup className="album-buttons">
                            <DropdownButton title="Albums" className="album-dropdown">
                                {this.props.albumNames.map(function(albumName) {
                                    return <MenuItem active={albumName === this.props.currentAlbum} ref={albumName} key={albumName} className="album-item" onClick={() => this.albumSelected(albumName)}> {albumName} </MenuItem>
                                }, this)}
                            </DropdownButton>
                            <Button onClick={() => this.createAlbumPrompt()} className="create-album-prompt"> Create Album </Button> 
                        </ButtonGroup>
                    </div>
                    <div className="image-list-div">
                        <ul className="image-list">
                            {Object.keys(this.props.albumPhotos).map(function(photo) {
                                if (photo.indexOf("/") !== -1) {
                                    return <ImageHint key={Encoder.decodeKey(photo)} imageURL={Encoder.decodeKey(photo)} parentAlbum={this.props.albumPhotos[photo]["parentAlbum"]} editHistory={this.props.albumPhotos[photo]["editHistory"]} displayCallback={this.props.displayCallback} className="image-list-item" />
                                }
                            }, this)}
                        </ul>
                    </div>
                </div>
                <div className="album-creation">
                    <CreateAlbum {...createAlbumProps}/>
                </div>
            </div>
        );
    }
}

export default ImageSelection;