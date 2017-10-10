import React from "react"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/imagecanvas.css");
}

/**
 * Canvas for displaying the image to be edited
 */
class ImageCanvas extends React.Component {

    constructor(props) {
        super(props);
        this.state = props;

        this.loadImageFromFile = this.loadImageFromFile.bind(this);
        this.loadImageFromURL = this.loadImageFromURL.bind(this);
    }

    componentDidMount() {
        this.loadImageFromURL(this.state.currentImageURL);
        this.state.canvasMounted(this.refs["image-canvas"]);
    }

    componentWillReceiveProps(nextProps) {

        // indicates that there is not a new image to upload
        if (this.state !== undefined && 
            this.state.currentImageURL === nextProps.currentImageURL) {
            return;
        }

        if (nextProps.currentImageURL === "pending") {
            // file is from user upload
            this.loadImageFromFile(nextProps.currentImage);
        } else {
            // file is selected from image hint
            this.loadImageFromURL(nextProps.currentImageURL);
        }

        this.setState(nextProps);   
    }
    
    /**
     * Only updates if there is a new file to load (via URL or file object)
     * @param {*} nextProps next props of the component 
     * @param {*} nextState next state of the component
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (this.state === undefined || this.state.currentImage === undefined) {
            return true;
        }
        if (this.state.currentImageURL === nextProps.currentImageURL && 
                this.state.currentImage.name === nextProps.currentImage.name) {
            return false;
        }
        return true;
    }

    /**
     * Given a file url, loads it onto the canvas
     * The image source is the URL on the server received from a GET request
     */
    loadImageFromURL(newImageURL) {
        if (newImageURL === undefined) {
            return;
        }

        // get canvas elements
        var imageCanvas = this.refs["image-canvas"];
        var imageCanvasContext = imageCanvas.getContext("2d");

        // clear previous image
        imageCanvasContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

        if (newImageURL.constructor === String) {

            // load new image from URL
            var image = new Image();
            image.crossOrigin = '';

            image.src = newImageURL;

            image.onload = function() {
            
                // draw new image onto canvas
                imageCanvas.width = image.width;
                imageCanvas.height = image.height;
                imageCanvasContext.drawImage(image, 0, 0, image.width, image.height,
                                         0, 0, imageCanvas.width, imageCanvas.height);

                this.state.imageChangedFromHint(image);

                // update canvas data in Caman
                window.Caman("#image-canvas", function() {
                    this.reloadCanvasData();
                });

            }.bind(this);
        }
    }

    /**
     * Loads an image from a file object onto the canvas
     * @param {*} imageFile the new file to be loaded onto the canvas
     */
    loadImageFromFile(imageFile) {

        var reader = new FileReader();
        reader.onload = function(event) {

            // load new image from file
            var image = new Image();

            image.src = event.target.result;

            image.onload = function() {

                // get canvas elements
                var imageCanvas = this.refs["image-canvas"];
                var imageCanvasContext = imageCanvas.getContext("2d");

                // clear the previous image
                imageCanvasContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

                // draw the new image
                imageCanvas.width = image.width;
                imageCanvas.height = image.height;
                imageCanvasContext.drawImage(image, 0, 0, image.width, image.height,
                                          0, 0, imageCanvas.width, imageCanvas.height);

                this.state.imageDrawn();

                // update canvas data in Caman
                window.Caman("#image-canvas", function() {
                    this.reloadCanvasData();
                });
            
            }.bind(this);
        }.bind(this);

        reader.readAsDataURL(imageFile);
    }

    render() {
        return (
            <canvas id="image-canvas" ref="image-canvas"> </canvas>
        );
    }
}

export default ImageCanvas;