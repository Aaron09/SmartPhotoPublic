import React from "react"

import AlbumPhotoItem from "./albumphotoitem"

import Encoder from "./encoder"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/albumphotolist.css");
}

/**
 * Component for viewing the photos in an album on the storage page
 */
export default class AlbumPhotoList extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = props;

        this.searchEntered = this.searchEntered.bind(this);
        this.extractPhotoName = this.extractPhotoName.bind(this);
    }

    componentWillReceiveProps(nextProps) {
       this.setState(nextProps);
    }

    /**
     * Function called when a value is entered in the search bar
     * @param {*} event event trigged when the user enters a value in the search bar
     */
    searchEntered(event) {
        // if the search value is empty, return to default order
        if (event.target.value === "") {
            this.props.photoOrderChanged(this.props.preservedPhotoOrder.slice());
            this.props.photoSearchMade(event.target.value);
            return;
        } 

        // sort albums based on search
        var search = event.target.value.toLowerCase();
        var newPhotos = this.props.activePhotoOrder;
        var i = newPhotos.length - 1;
        var foundAmount = 0;

        while (i >= foundAmount) {
            if (this.extractPhotoName(newPhotos[i]).substring(0, search.length).toLowerCase() === search) {
                var matchedPhoto = newPhotos[i];
                newPhotos.splice(i, 1);
                newPhotos.unshift(matchedPhoto);
                foundAmount += 1;
            }
            i--;
        }

        this.props.photoSearchMade(search);
        this.props.photoOrderChanged(newPhotos);
    }

    /**
     * Extracts the name of the image from a given url
     * @param {*} url the full url of the image
     */
     extractPhotoName(url) {
        url = url.substring(url.indexOf('smartphoto-storage-bucket/'));
        url = url.substring(url.indexOf('/') + 1);
        url = url.substring(url.indexOf('/') + 1);
        url = url.substring(url.indexOf('/') + 1);
        url = url.substring(url.indexOf('/') + 1);
        return url;
    }

    render() {
        if (this.props.album === undefined || this.props.album == null) {
            return (
                <span className="click-info"> Click on an album to see it's photos displayed here. </span>
            );
        } else {
            return (
                <div className="album-photo-list">
                    <input className="photo-search" onChange={this.searchEntered} type="text" name="search" placeholder={"Search " + this.props.liveAlbum + "..."} />
                    <div className="photo-list">
                        {this.props.activePhotoOrder.map(function(photo) {
                            if (photo.indexOf("/") !== -1) {
                                return <AlbumPhotoItem key={Encoder.decodeKey(photo)} photoURL={Encoder.decodeKey(photo)} selectedPhotos={this.props.selectedPhotos} photoSelected={this.props.photoSelected} />
                            }
                        }, this)}
                    </div>
                </div>
            );
        }
    }
}