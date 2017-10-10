import React from 'react';
import ReactDOM from 'react-dom';

import ManagementPanel from "./managementpanel"
import ImageCanvas from "./imagecanvas"
import ImageSelection from "./imageselection"
import EditPanel from "./editpanel"
import AlbumPopUp from "./albumpopup"
import NavigationBar from "./navigationbar"
import EditingTools from "./editingtools"

import Encoder from "./encoder"

"use strict";

const SAVING_COMPLETE_MESSAGE = "All changes saved in SmartPhoto";
const CURRENT_SAVING_MESSAGE = "Saving...";

if (process.env.BROWSER) {
    require('../static/css/rootimageeditor.css');
}

/**
 * Component which serves as the root display of all UI on the page
 */
class RootImageEditor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      mainCanvas: undefined,
      albumPopUp: undefined,
      currentImage: undefined,
      currentImageURL: "",
      currentAlbumHintDisplay: "All Photos",
      currentMainPhotoAlbum: "",
      currentAlbumPhotos: {},
      albumNames: [],
      albums: {},
      showUploadModal: false,
      showAlbumCreationModal: false,
      savingStatus: SAVING_COMPLETE_MESSAGE,

      imageProperties: {
        Brightness: 0,
        Saturation: 0,
        Exposure: 0,
        Contrast: 0,
        Vibrance: 0,
        Hue: 0,
        Gamma: 0,
        Clip: 0,
        Blur: 0,
        Sepia: 0,
        Noise: 0,
        Sharpen: 0,
        editHistory: [],
        invert: false,
        redEye: false,
        teethWhiten: false
      },

      previousFilterValues: {
        Brightness: 0,
        Saturation: 0,
        Exposure: 0,
        Contrast: 0,
        Vibrance: 0,
        Hue: 0,
        Gamma: 0,
        Clip: 0,
        Blur: 0,
        Sepia: 0,
        Noise: 0,
        Sharpen: 0
      }
    };

    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.displayImage = this.displayImage.bind(this);
    this.albumSelected = this.albumSelected.bind(this);
    this.sliderMovementMade = this.sliderMovementMade.bind(this);
    this.sliderChangeComplete = this.sliderChangeComplete.bind(this);
    this.setImageURL = this.setImageURL.bind(this);
    this.imageChangedFromHint = this.imageChangedFromHint.bind(this);
    this.checkMade = this.checkMade.bind(this);
    this.performEdit = this.performEdit.bind(this);
    this.performAllEdits = this.performAllEdits.bind(this);
    this.saveImageData = this.saveImageData.bind(this);
    this.canvasMounted = this.canvasMounted.bind(this);
    this.getImageNameFromPath = this.getImageNameFromPath.bind(this);
    this.requestAlbums = this.requestAlbums.bind(this);
    this.extractPhotoURLs = this.extractPhotoURLs.bind(this);
    this.extractImageName = this.extractImageName.bind(this);
    this.parseURLForName = this.parseURLForName.bind(this);
    this.uploadConfirmed = this.uploadConfirmed.bind(this);
    this.albumPopUpMounted = this.albumPopUpMounted.bind(this);
    this.albumCreated = this.albumCreated.bind(this);
    this.uploadCancelled = this.uploadCancelled.bind(this);
    this.imageDrawn = this.imageDrawn.bind(this);
    this.rotationMade = this.rotationMade.bind(this);
    this.extractAlbumNames = this.extractAlbumNames.bind(this);
    this.requestAlbum = this.requestAlbum.bind(this);
    this.extractFileType = this.extractFileType.bind(this);
  }

  /**
   * Performs GET requests for data once the component is mounted and state is set
   */
  componentDidMount() {
    this.requestAlbums(function() {
      this.setState({currentAlbumPhotos: this.state.albums["All Photos"]});
    }.bind(this));
  }

  /**
   * Performs GET request for the users list of albums
   */
  requestAlbums(setupCallback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          var albumData = JSON.parse(Encoder.decodeKey(xmlHttp.response))["albums"];
          var albumNames = Object.keys(albumData);
          this.setState({albums: (albumData == null ? [] : albumData), albumNames: albumNames});
          setupCallback();
        }
    }.bind(this);
    var asynchronous = true;
    xmlHttp.open("GET", "/userstorage/albums", asynchronous);
    xmlHttp.send(null);
  }

  /**
   * Requests a specific album to be updated on the client-side
   * @param {*} specificAlbum the album being updated
   */
  requestAlbum(specificAlbum) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        var album = JSON.parse(Encoder.decodeKey(xmlHttp.response));

        var updatedAlbums = this.state.albums;
        updatedAlbums[specificAlbum] = album;

        if (this.state.currentAlbumHintDisplay === specificAlbum) {
          this.setState({albums: updatedAlbums, currentAlbumPhotos: album});
        } else {
          this.setState({albums: updatedAlbums});
        }
      }
    }.bind(this);
    var asynchronous = true;
     var url = (specificAlbum === "All Photos" ? 
            "/userstorage/allPhotos" : "/userstorage/albums/" + specificAlbum); 
    xmlHttp.open("GET", url, asynchronous);
    xmlHttp.send(null);
  }

  /**
   * Extracts all of the names of the user's albums
   * @param {*} albumMap hashmap of the user's albums
   */
  extractAlbumNames(albumMap) {
    var albumNames = [];
    for (var albumName in albumMap) {
      albumNames.push(albumName);
    }
    return albumNames;
  }

  /**
   * Extracts the image name from the current image
   */
  extractImageName() {
    if (this.state.currentImage.constructor === File) {
      return this.state.currentImage.name;
    } else {
      return this.parseURLForName(this.state.currentImage.src);
    }
  }

  /**
   * Extracts the file type / extension of the current image
   */
  extractFileType() {
    if (this.state.currentImageURL == "") {
      return "";
    }
    var fileName = this.parseURLForName(this.state.currentImageURL);
    var fileExtension = fileName.substring(fileName.indexOf(".") + 1);

    if (fileExtension == undefined || fileExtension == null || fileExtension == "") {
      return "";
    }

    fileExtension = fileExtension.toLowerCase();
    if (fileExtension === "jpg" || fileExtension === "jpeg") {
      return "jpeg";
    } else if (fileExtension === "png") {
      return "png";
    } else {
      return "";
    }
  }

  /**
   * Extracts the image name from the src url
   * @param {*} url the source url of the image
   */
  parseURLForName(url) {
    url = url.substring(url.indexOf('smartphoto-storage-bucket/'));
    url = url.substring(url.indexOf('/') + 1);
    url = url.substring(url.indexOf('/') + 1);
    url = url.substring(url.indexOf('/') + 1);
    url = url.substring(url.indexOf('/') + 1);
    return url;
  }

  /**
   * Extracts the URLs from a list of photo objects
   * @param {*} photoList photo urls and history retrieved from the database 
   */
  extractPhotoURLs(photoList) {
    var urls = [];
    for (var i = 0; i < photoList.length; i++) {
      urls.push(photoList[i].photoURL);
    }
    return urls;
  }

  /**
   * Updates the UI with the new album
   * @param {*} albumName the name of the new album
   */
  albumCreated(albumName) {
    var albumNames = this.state.albumNames;
    albumNames.push(albumName);

    var newAlbum = {}
    var updatedAlbums = this.state.albums;
    updatedAlbums[albumName] = newAlbum;

    this.setState({albumNames: albumNames, albums: updatedAlbums});
  }

  /**
   * Lets us keep a reference to the main canvas for rebuilding images upon edits
   * @param {*} canvas the main canvas for editing
   */
  canvasMounted(canvas) {
    this.setState({mainCanvas: canvas});
  }

  /**
   * Let's us keep a reference to the image pop up for appearing and disappearing on file upload
   * @param {*} albumPopUp reference to the album selection pop up
   */
  albumPopUpMounted(albumPopUp) {
    this.setState({albumPopUp: albumPopUp});
  }

  /**
   * Handles when the user uploads a file and sends it to the database, updating the state
   * and showing the new image
   * @param {*} imageFile the file the user uploaded
   */
  handleFileUpload(imageFile) {   
    this.setState({currentImageURL: "pending", currentImage: imageFile, editHistory: []});
  }

  /**
   * Callback for when the canvas has completed drawing the image,
   * then load the upload confirmation modal
   */
  imageDrawn() {
    this.setState({showUploadModal: true});
  }

  /**
   * Called when the user has selected the desired album and confirmed the upload
   * @param {*} url the url of the uploaded image
   * @param {*} destinationAlbum the desired album to house the image
   */
  uploadConfirmed(url, destinationAlbum) {
    if (this.state.showUploadModal === true) {
      this.setState({showUploadModal: false});
    }
    // redownload the album to which the user just uploaded for live image hint updates
    this.requestAlbum(destinationAlbum);
    if (this.state.currentAlbumHintDisplay === "All Photos") {
      this.requestAlbum("All Photos");
    }
    this.setState({currentMainPhotoAlbum: destinationAlbum, currentImageURL: url});
  }

  /**
   * Callback for the upload modal on upload cancellation
   */
  uploadCancelled() {
    this.setState({showUploadModal: false, currentImageURL: "", currentImage: undefined});

    var mainCanvasContext = this.state.mainCanvas.getContext("2d");
    mainCanvasContext.clearRect(0, 0, this.state.mainCanvas.width, this.state.mainCanvas.height);

    window.Caman("#image-canvas", function() {
      this.reloadCanvasData();
    });
  }

  /**
   * Callback function for when the image is saved in the database from the canvas
   * @param {*} newImageURL the new URL of the current image
   */
  setImageURL(newImageURL) {
    this.setState({currentImageURL: newImageURL});
  }

  /**
   * Displays an image based on the given URL
   * @param {*} imageName the URL of the image to be displayed
   */
  displayImage(chosenImageURL, parentAlbum, editHistory) {
    var imageProperties = this.state.imageProperties;
    imageProperties.editHistory = editHistory;

    this.setState({currentMainPhotoAlbum: parentAlbum, 
      currentImageURL: chosenImageURL, imageProperties: imageProperties});
  }

  /**
   * Callback function for when the canvas loads an image via URL from the image hint,
   * we need to store the image object for rebuilding during editing
   * @param {*} imageObject the new image object of the canvas
   */
  imageChangedFromHint(imageObject) {
    this.setState({currentImage: imageObject});
  }

  /**
   * Updates the image hints and selected album by the album the user has selected
   * @param {*} album the album selected by the user
   */
  albumSelected(albumName) {
    this.setState({currentAlbumHintDisplay: albumName, currentAlbumPhotos: this.state.albums[albumName]});
  }

  /**
   * Saves an image to it's appropriate album in the database
   * @param {*} imageName the name of the image being saved
   * @param {*} base64Image the base64 version of the image
   * @param {*} imageEditHistory the edit history of the image
   * @param {*} destinationAlbum the album to which the image belongs
   */
  saveImageData(imageName, blob, imageEditHistory, destinationAlbum, currentImageURL, fileExtension) {
    if (imageName === undefined) {
      return;
    }

    this.setState({savingStatus: CURRENT_SAVING_MESSAGE});

    var imageFile = new File([blob], "/tmp/temp" + fileExtension);

    var XMLHttp = new XMLHttpRequest();
    var url = "/edit/save";
    XMLHttp.open("POST", url, true);

    XMLHttp.onreadystatechange = function() {
        if(XMLHttp.readyState == 4 && XMLHttp.status == 200) {
          this.setState({savingStatus: SAVING_COMPLETE_MESSAGE})
        }
    }.bind(this);

    var formData = new FormData();
    formData.append("imageData", imageFile);
    formData.append("editHistory", imageEditHistory);
    formData.append("albumName", destinationAlbum);
    formData.append("imagePath", currentImageURL);
    formData.append("imageName", imageName);
    XMLHttp.send(formData);
  }

  /**
   * The user moves an edit slider but does not release
   * @param {*} editType the slider being moved
   * @param {*} newValue the value to which the slider was moved
   */
  sliderMovementMade(editType, newValue) {
    var imageProperties = this.state.imageProperties;
    imageProperties[editType] = newValue;
    this.setState({imageProperties});
  }

  /**
   * Called when the user has released the slider to show their change
   * @param {*} filterType the filter / slider being used
   * @param {*} newValue the new value of the slider
   */
  sliderChangeComplete(filterType, newValue) {

    if (this.state.currentImage === undefined) {
      return;
    }

    // generate new edit object
    var newEdit = {[filterType]: newValue};

    // check to see if the edit can be performed without a rebuild
    var rebuildNecessary = false;
    if ((newValue > this.state.previousFilterValues[filterType] && this.state.previousFilterValues[filterType] < 0) ||
          (newValue < this.state.previousFilterValues[filterType] && this.state.previousFilterValues[filterType] > 0)) {
        rebuildNecessary = true;
    }

    this.state.imageProperties.editHistory.push(newEdit);

    if (rebuildNecessary) {

      // clear the edited image, redraw the soirce image
      var canvasContext = this.state.mainCanvas.getContext("2d");
      canvasContext.clearRect(0, 0, this.state.mainCanvas.width, this.state.mainCanvas.height);
      canvasContext.drawImage(this.state.currentImage, 0, 0, 
                              this.state.currentImage.width, this.state.currentImage.height,
                              0, 0, this.state.mainCanvas.width, this.state.mainCanvas.height);

      // update the new edit value and re-perform all edits
      this.state.previousFilterValues[filterType] = newValue;
      this.performAllEdits(this.state.imageProperties.editHistory, this.performEdit);
    } else {

      // perform edit based on incremental difference between the previous and new edit
      var previousValue = this.state.previousFilterValues[filterType];

      // set the new edit value
      this.state.previousFilterValues[filterType] = newValue;

      this.performEdit(filterType, (newValue - previousValue));

      var imageName = this.getImageNameFromPath(this.state.currentImageURL);
      var saveImageData = this.saveImageData;
      var imageEditHistory = this.state.imageProperties.editHistory;
      var currentMainPhotoAlbum = this.state.currentMainPhotoAlbum;
      var currentImageURL = this.state.currentImageURL;
      var mainCanvas = this.state.mainCanvas;
      var currentImage = this.state.currentImage;
      var fileExtension = this.extractFileType();

      window.Caman("#image-canvas", function() {
        this.render(function() {
          setTimeout(function() {
            var imageData = mainCanvas.toBlob(function(blob) {
                saveImageData(imageName, blob, imageEditHistory, currentMainPhotoAlbum, currentImageURL, fileExtension);
            }, 'image/' + fileExtension);
          }.bind(this), 0);
        });
      });
    }
  }

  /**
   * Gets the name of the image from the full path
   * @param {*} imagePath the full path of the image
   */
  getImageNameFromPath(imagePath) {
    var imageName = imagePath.substring(imagePath.indexOf('albums'));
    imageName = imageName.substring(imageName.indexOf("/") + 1);
    imageName = imageName.substring(imageName.indexOf("/") + 1);
    return imageName;
  }

  /**
   * Adds all edits to an image
   * @param {*} allEdits a history of edits performed by the user
   */
  performAllEdits(allEdits, performEdit) {
    var prevValues = this.state.previousFilterValues;
    var imageName = this.getImageNameFromPath(this.state.currentImageURL);
    var saveImageData = this.saveImageData;
    var imageEditHistory = this.state.imageProperties.editHistory;
    var currentMainPhotoAlbum = this.state.currentMainPhotoAlbum;
    var currentImageURL = this.state.currentImageURL;
    var fileExtension = this.extractFileType();

    window.Caman("#image-canvas", function() {
      this.reloadCanvasData();

      // go through all edits
      for (var i = 0; i < allEdits.length; i++) {
        var currentEdit = allEdits[i];
        var filterType = undefined
        var editValue = undefined;

        // get the filter type and value of the current edit object
        for (var key in currentEdit) {
          if (currentEdit.hasOwnProperty(key)) {
            filterType = key;
            editValue = currentEdit[filterType];
          }
        }

        if (filterType !== undefined && editValue !== undefined) {

          // if this is a valid edit and will not lead to a later rebuild in the
          // rebuild process, perform the edit
          if ((editValue <= prevValues[filterType] && prevValues[filterType] > 0 && editValue > 0) ||
              (editValue >= prevValues[filterType] && prevValues[filterType] < 0 && editValue < 0)) {
            prevValues[filterType] = editValue;
            
            if (filterType === "Brightness") {
              this.brightness(editValue);
            } else if (filterType === "Saturation") {
              this.saturation(editValue);
            } else if (filterType === "Exposure") {
              this.exposure(editValue);
            } else if (filterType === "Contrast") {
              this.contrast(editValue);
            } else if (filterType === "Vibrance") {
              this.vibrance(editValue);
            } else if (filterType === "Hue") {
              this.hue(editValue);
            } else if (filterType === "Gamma") {
              this.gamma(editValue);
            } else if (filterType === "Clip") {
              this.clip(editValue);
            } else if (filterType === "Blur") {
              this.stackBlur(editValue);
            } else if (filterType === "Sepia") {
              this.sepia(editValue);
            } else if (filterType === "Noise") {
              this.noise(editValue);
            } else if (filterType === "Sharpen") {
              this.sharpen(editValue);
            }
          }
        }
      }

      // show image edits
      this.render(function() {
        setTimeout(function() {
            var imageData = mainCanvas.toBlob(function(blob) {
              saveImageData(imageName, blob, imageEditHistory, currentMainPhotoAlbum, currentImageURL, fileExtension);
            }, 'image/' + fileExtension);
        }.bind(this), 0);
      });
    });
  }

  /**
   * Performs an image edit using Caman
   * @param {*} filterType the name of the filter
   * @param {*} editValue the value of the filter
   */
  performEdit(filterType, editValue) {
    window.Caman("#image-canvas", function() {
      this.reloadCanvasData();

      if (filterType === "Brightness") {
        this.brightness(editValue);
      } else if (filterType === "Saturation") {
        this.saturation(editValue);
      } else if (filterType === "Exposure") {
        this.exposure(editValue);
      } else if (filterType === "Contrast") {
        this.contrast(editValue);
      } else if (filterType === "Vibrance") {
        this.vibrance(editValue);
      } else if (filterType === "Hue") {
        this.hue(editValue);
      } else if (filterType === "Gamma") {
        this.gamma(editValue);
      } else if (filterType === "Clip") {
        this.clip(editValue);
      } else if (filterType === "Blur") {
        this.stackBlur(editValue);
      } else if (filterType === "Sepia") {
        this.sepia(editValue);
      } else if (filterType === "Noise") {
        this.noise(editValue);
      } else if (filterType === "Sharpen") {
        this.sharpen(editValue);
      }
    });
  }

  /**
   * Callback function for when a checkbox is selected to make an edit
   * @param {*} checkboxName the name of the edit checkbox
   */
  checkMade(checkboxName) {
    if (checkboxName === "invert") {
      var imageName = this.getImageNameFromPath(this.state.currentImageURL);
      var saveImageData = this.saveImageData;
      var imageEditHistory = this.state.imageProperties.editHistory;
      var currentMainPhotoAlbum = this.state.currentMainPhotoAlbum;
      var fileExtension = this.extractFileType();

      window.Caman("#image-canvas", function() {
        this.reloadCanvasData();
        this.invert().render(function() {
          setTimeout(function() {
            var imageData = mainCanvas.toBlob(function(blob) {
              saveImageData(imageName, blob, imageEditHistory, currentMainPhotoAlbum, currentImageURL, fileExtension);
            }, 'image/' + fileExtension);
          }.bind(this), 0);
        });
      });
    }

    this.setState({checkboxName: !this.state.checkboxName})
  }

  /**
   * Called when the user presses the rotate button
   */
  rotationMade() {
    if (this.state.currentImage === undefined) {
      return;
    }

    var imageName = this.getImageNameFromPath(this.state.currentImageURL);
    var saveImageData = this.saveImageData;
    var imageEditHistory = this.state.imageProperties.editHistory;
    var currentMainPhotoAlbum = this.state.currentMainPhotoAlbum;
    var fileExtension = this.extractFileType();

    window.Caman("#image-canvas", function() {
      this.reloadCanvasData();
      this.rotate(90).render(function() {
          setTimeout(function() {
            var imageData = mainCanvas.toBlob(function(blob) {
              saveImageData(imageName, blob, imageEditHistory, currentMainPhotoAlbum, currentImageURL, fileExtension);
            }, 'image/' + fileExtension);
          }.bind(this), 0);
      });
    });
  }

  render() {
    var canvasProps = {
      currentImageURL: this.state.currentImageURL,
      currentImage: this.state.currentImage,
      setImageURL: this.setImageURL,
      imageChangedFromHint: this.imageChangedFromHint,
      canvasMounted: this.canvasMounted,
      imageDrawn: this.imageDrawn
    };

    var managementPanelProps = {
      currentImageURL: this.state.currentImageURL,
      handleFileUpload: this.handleFileUpload,
      albumPopUpPanel: this.refs["album-pop-up-root"]
    }

    // props for the image selections panel which contains the album and image display
    var imageSelectionProps = {
      currentAlbum: this.state.currentAlbumHintDisplay,
      albumSelectionCallback: this.albumSelected,
      displayCallback: this.displayImage,
      albumNames: this.state.albumNames,
      albumPhotos: this.state.currentAlbumPhotos,
      albumCreated: this.albumCreated
    }

    // props for the editing tools component
    var editingToolsProps = {
      savingStatus: this.state.savingStatus
    }

    var editProperties = {
      // checkbox properties
      checkboxList: ["invert", "redEye", "teethWhiten"],
      checkMade: this.checkMade,
      checkboxProperties: {
        invert: this.state.invert,
        redEye: this.state.redEye,
        teethWhiten: this.state.teethWhiten
      },

      // filter list properties
      filterList: ["Brightness", "Saturation", "Exposure", "Contrast", "Vibrance", "Hue", 
                  "Clip", "Gamma", "Blur", "Sepia", "Noise", "Sharpen"],
      filterProperties: { 
        Brightness: {
          min: -100,
          max: 100,
          value: this.state.imageProperties.Brightness,
          defaultValue: 0
        },
        Saturation: {
          min: -100,
          max: 100,
          value: this.state.imageProperties.Saturation,
          defaultValue: 0
        },
        Exposure: {
          min: -100,
          max: 100, 
          value: this.state.imageProperties.Exposure,
          defaultValue: 0
        },
        Contrast: {
          min: -100,
          max: 100,
          value: this.state.imageProperties.Contrast,
          defaultValue: 0
        },
        Vibrance: {
          min: -100,
          max: 100,
          value: this.state.imageProperties.Vibrance,
          defaultValue: 0
        },
        Hue: {
          min: 0,
          max: 100,
          value: this.state.imageProperties.Hue,
          defaultValue: 0
        },
        Gamma: {
          min: 0,
          max: 10,
          value: this.state.imageProperties.Gamma,
          defaultValue: 0
        },
        Clip: {
          min: 0,
          max: 100,
          value: this.state.imageProperties.Clip,
          defaultValue: 0
        },
        Blur: {
          min: 0,
          max: 20,
          value: this.state.imageProperties.Blur,
          defaultValue: 0
        },
        Sepia: {
          min: 0,
          max: 100,
          value: this.state.imageProperties.Sepia,
          defaultValue: 0
        },
        Noise: {
          min: 0,
          max: 100,
          value: this.state.imageProperties.Noise,
          defaultValue: 0
        },
        Sharpen: {
          min: 0,
          max: 100,
          value: this.state.imageProperties.Sharpen,
          defaultValue: 0
        }
      },
      sliderMovementMade: this.sliderMovementMade,
      sliderChangeComplete: this.sliderChangeComplete
    }

    var filename = this.state.currentImage === undefined ? "No image yet." : this.extractImageName();

    var albumPopUpProps = {
      uploadFileName: filename,
      albumNames: this.state.albumNames,
      uploadConfirmed: this.uploadConfirmed,
      albumPopUpMounted: this.albumPopUpMounted,
      uploadedImage: this.state.currentImage,
      saveUploadData: this.saveUploadData,
      editHistory: [],
      currentImage: this.state.currentImage,
      showModal: this.state.showUploadModal,
      uploadCancelled: this.uploadCancelled
    };

    return (
      <div className="div-root">
        <NavigationBar auth={this.props.auth} />
        <EditingTools {...editingToolsProps} />
        <div className="editor">
          <ImageSelection {...imageSelectionProps} className="image-selection-root" />
          <ImageCanvas {...canvasProps} id="image-canvas-root" />
          <ManagementPanel {...managementPanelProps} className="management-panel-root" />
          <EditPanel {...editProperties} className="edit-panel-element" />
          <AlbumPopUp {...albumPopUpProps} ref="album-pop-up-root" className="album-pop-up-root" />
        </div>
      </div>
    );
  }
}

export default RootImageEditor;
