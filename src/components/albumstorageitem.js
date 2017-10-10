import React from "react"

import LazyLoad from "react-lazy-load"
import { Panel } from "react-bootstrap"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/albumstorageitem.css");
}

/**
 * Component for a single album and info in the storage page
 */
export default class AlbumStorageItem extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = props;

        this.albumSelected = this.albumSelected.bind(this);
        this.drop = this.drop.bind(this);
        this.allowDrop = this.allowDrop.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }

    /**
     * Callback for when the user selects an album to view
     */
    albumSelected() {
        this.state.albumSelected(this.state.name);
    }

    /**
     * Triggered when the user releases the drop onto the album
     * @param {*} event the drag event of the image
     */
    drop(event) {
        event.preventDefault();
        var data = event.dataTransfer.getData("photoDrag");

        var fullURL = data;
        var filePath = fullURL.substring(fullURL.indexOf('/userstorage/'));

        var oldAlbum = fullURL.substring(fullURL.indexOf('albums/') + 7);
        oldAlbum = oldAlbum.substring(0, oldAlbum.indexOf('/'));

        // Photo is already in the desired album
        if (oldAlbum === this.state.name) {
            return;
        }

        var payload = {
            url: filePath,
            newAlbum: this.state.name,
            oldAlbum: oldAlbum
        }

        
        var url = "/storage/move";
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");

        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                this.props.photoMoved(oldAlbum, this.state.name);
            }
        }.bind(this);
        xmlHttp.send(JSON.stringify(payload));
    }

    /**
     * Prevents drag from defaulting upon entering the album drop zone
     * @param {*} event the drag event of the image
     */
    allowDrop(event) {
        event.preventDefault();
    }

    render() {
        var buttonStyle = this.state.liveAlbum === this.state.name ? "primary" : "info";

        // All Photos is not a valid drop zone
        if (this.state.name === "All Photos") {
            return (
                <LazyLoad> 
                    <div className="album-storage-item-div">
                        <Panel className="album-storage-item" bsStyle={buttonStyle} header={this.state.name} onClick={this.albumSelected} >
                            {this.state.size + " Photo(s)"}
                        </Panel>
                    </div>
                </LazyLoad>
            );
        } else {
            return (
                <LazyLoad> 
                    <div className="album-storage-item-div" onDrop={this.drop} onDragOver={this.allowDrop}>
                        <Panel className="album-storage-item" bsStyle={buttonStyle} header={this.state.name} onClick={this.albumSelected} >
                            {this.state.size + " Photo(s)"}
                        </Panel>
                    </div>
                </LazyLoad>
            );
        }
    }
}