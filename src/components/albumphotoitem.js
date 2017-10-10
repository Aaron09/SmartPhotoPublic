import React from "react"

import LazyLoad from "react-lazy-load"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/albumphotoitem.css");
}

/**
 * Component for viewing a photo on the storage page
 */
export default class AlbumPhotoItem extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = props;
        
        this.extractPhotoName = this.extractPhotoName.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }

    /**
     * Extracts the name of the photo from the URL
     */
    extractPhotoName() {
        var url = this.state.photoURL;
        url = url.substring(url.indexOf('smartphoto-storage-bucket/'));
        url = url.substring(url.indexOf('/') + 1);
        url = url.substring(url.indexOf('/') + 1);
        url = url.substring(url.indexOf('/') + 1);
        url = url.substring(url.indexOf('/') + 1);
        return url;
    }

    /**
     * Drag action to move a photo to a different album by drag and drop
     * @param {*} event the drag event for the photo
     */
    drag(event) {
        event.dataTransfer.setData("photoDrag", event.target.src);
    }

    render() {
        var active = false;
        if (this.state.photoURL in this.props.selectedPhotos) {
            active = this.props.selectedPhotos[this.state.photoURL];
        }

        return (
            <LazyLoad>
                <div className={active ? "photo-item-selected" : "photo-item"} onClick={() => this.props.photoSelected(this.state.photoURL)} >
                    <div className={active ? "photo-name-div-selected" : "photo-name-div"}>
                        <span className="photo-name"> {this.extractPhotoName()} </span>
                    </div>  
                    <div className="album-photo-div">
                        <img className="album-photo" id="album-photo" alt="" src={this.state.photoURL} ref={this.state.photoURL} draggable="true" onDragStart={this.drag} crossOrigin="anonymous"/>
                    </div>
                </div>
            </LazyLoad>
        );
    }
}