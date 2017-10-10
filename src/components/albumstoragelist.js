import React from "react"

import AlbumStorageItem from "./albumstorageitem"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/albumstoragelist.css");
}

/**
 * Component for the user to view and move their photos in the storage page
 */
export default class AlbumStorageList extends React.Component {
    constructor(props) {
        super(props);

        this.state = props;

        this.searchEntered = this.searchEntered.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.state = nextProps;
    }

    /**
     * Function called when a value is entered in the search bar
     * @param {*} event event trigged when the user enters a value in the search bar
     */
    searchEntered(event) {
        // if the search value is empty, return to default order
        if (event.target.value === "") {
            this.props.albumOrderChanged(this.props.preservedAlbumOrder.slice());
            this.props.albumSearchMade(event.target.value);
            return;
        } 

        // sort albums based on search
        var search = event.target.value.toLowerCase();
        var newAlbums = this.props.albumNames;
        var i = newAlbums.length - 1;
        var foundAmount = 0;

        while (i >= foundAmount) {
            if (newAlbums[i].substring(0, search.length).toLowerCase() === search) {
                var matchedAlbum = newAlbums[i];
                newAlbums.splice(i, 1);
                newAlbums.unshift(matchedAlbum);
                foundAmount += 1;
            }
            i--;
        }

        this.props.albumSearchMade(search);
        this.props.albumOrderChanged(newAlbums);
    }

    render() {
        return (
            <div className="album-storage-root">
                <input className="album-search" type="text" name="search" placeholder={"Search Albums..."} onChange={this.searchEntered} value={this.props.searchTerm} />
                <div className="album-list">
                    {this.props.albumNames.map(function(album) {
                        return <AlbumStorageItem liveAlbum={this.props.liveAlbum} name={album} size={this.props.albums[album]["size"]} albumSelected={this.props.albumSelectedCallback} photoMoved={this.props.photoMoved}/>
                    }, this)}
                </div>
            </div>
        );
    }
}