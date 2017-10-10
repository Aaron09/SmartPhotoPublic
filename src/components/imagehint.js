import React from "react"

import LazyLoad from "react-lazy-load"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/imagehint.css");
}

/**
 * Component which displays an image hint for an image
 */
class ImageHint extends React.Component {
    constructor(props) {
        super(props);
        this.state = props;

        this.imageSelected = this.imageSelected.bind(this);
    }

    /**
     * Callback for an image being selected for main display
     */
    imageSelected() {
        this.props.displayCallback(this.state.imageURL, this.state.parentAlbum, this.state.editHistory);
    }

    render() {
        return (
            <LazyLoad>
                <img className="image-hint" alt="img" src={this.state.imageURL} crossOrigin="anonymous" ref={this.state.imageURL} onClick={this.imageSelected.bind(this)} />
            </LazyLoad>
        );
    }
}

export default ImageHint;
