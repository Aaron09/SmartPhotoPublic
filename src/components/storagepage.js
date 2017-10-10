import React from "react"

import NavigationBar from "./navigationbar"
import AlbumStorageList from "./albumstoragelist"
import AlbumPhotoList from "./albumphotolist"
import ContentManager from "./contentmanager"
import CreateAlbum from "./createalbum"
import DeletePhotosPopUp from "./deletephotospopup"
import DeleteAlbumPopUp from "./deletealbumpopup"

import Encoder from "./encoder"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/storagepage.css");
}

/**
 * Component which serves as the main storage page for the application
 */
class StoragePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            albums: {},
            liveAlbum: "All Photos",
            preservedAlbumOrder: [],
            activeAlbumOrder: [],
            activeAlbumSearch: "",
            preservedPhotoOrder: [],
            activePhotoOrder: [],
            activePhotoSearch: "",
            uploadTargetAlbum: "",
            showAlbumCreationModal: false,
            showPhotoDeletionModal: false,
            showAlbumDeletionModal: false,
            selectedPhotos: {}
        }

        this.albumSelectedCallback = this.albumSelectedCallback.bind(this);
        this.albumSearchMade = this.albumSearchMade.bind(this);
        this.albumOrderChanged = this.albumOrderChanged.bind(this);
        this.photoSearchMade = this.photoSearchMade.bind(this);
        this.photoOrderChanged = this.photoOrderChanged.bind(this);
        this.requestAlbum = this.requestAlbum.bind(this);
        this.photoMoved = this.photoMoved.bind(this);
        this.dropUploadOccured = this.dropUploadOccured.bind(this);
        this.uploadTargetSelected = this.uploadTargetSelected.bind(this);
        this.albumModalFinished = this.albumModalFinished.bind(this);
        this.createAlbumPrompt = this.createAlbumPrompt.bind(this);
        this.albumCreated = this.albumCreated.bind(this);
        this.photoSelected = this.photoSelected.bind(this);
        this.photoDeletionPrompt = this.photoDeletionPrompt.bind(this);
        this.albumDeletionPrompt = this.albumDeletionPrompt.bind(this);
        this.deletePhotosDecisionComplete = this.deletePhotosDecisionComplete.bind(this);
        this.deleteAlbumDecisionComplete = this.deleteAlbumDecisionComplete.bind(this);
    }

    componentDidMount() {
        // get albums
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var albumData = JSON.parse(xmlHttp.response)["albums"];
                var albumKeys = Object.keys(albumData);
                var photos = albumData == null ? [] : Object.keys(albumData["All Photos"]);

                this.setState({albums: (albumData == null ? [] : albumData), 
                    preservedAlbumOrder: (albumData == null ? [] : albumKeys.slice()), 
                    activeAlbumOrder: (albumData == null ? [] : albumKeys),
                    preservedPhotoOrder: photos.slice(), 
                    activePhotoOrder: photos,
                    uploadTargetAlbum: albumKeys.length > 1 ? albumKeys[1] : "Albums"});
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
                var album = JSON.parse(xmlHttp.response);

                // if the album being requested was just created,
                // we must update the orders to include the new album
                var isNewAlbum = true;
                if (specificAlbum in this.state.albums) {
                    isNewAlbum = false;
                }

                var updatedAlbums = this.state.albums;
                updatedAlbums[specificAlbum] = album;

                var newPhotoOrder = Object.keys(updatedAlbums[specificAlbum]);

                // update the photo orders if the album updated is the live album
                if (specificAlbum === this.state.liveAlbum) {
                    this.setState({albums: updatedAlbums, 
                        preservedPhotoOrder: newPhotoOrder.slice(), 
                        activePhotoOrder: newPhotoOrder});

                // update the album orders if the album updated is a new album
                } else if (isNewAlbum) {
                    // update the album orders
                    var activeAlbumOrder = this.state.activeAlbumOrder;
                    var preservedAlbumOrder = this.state.preservedAlbumOrder;
                    activeAlbumOrder.push(specificAlbum);
                    preservedAlbumOrder.push(specificAlbum);

                    this.setState({albums: updatedAlbums, 
                        activeAlbumOrder: activeAlbumOrder, 
                        preservedAlbumOrder: preservedAlbumOrder});
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
     * Callback for when the user selects a photo
     * @param {*} photoURL the url of the photo selected
     */
    photoSelected(photoURL) {
        var selectedPhotos = this.state.selectedPhotos;        
        if (photoURL in selectedPhotos) {
            delete selectedPhotos[photoURL];
        } else {
            selectedPhotos[photoURL] = true;
        }
        this.setState({selectedPhotos: selectedPhotos});
    }

    /**
     * Callback for when an album is selected in the album list
     * @param {*} albumName the name of the album selected
     */
    albumSelectedCallback(albumName) {
        var photos = Object.keys(this.state.albums[albumName]);
        this.setState({liveAlbum: albumName,
            preservedPhotoOrder: photos.slice(), 
            activePhotoOrder: photos});
    }

    /**
     * Callback for when a search term is entered for album search
     * @param {*} searchTerm the term entered for album search
     */
    albumSearchMade(searchTerm) {
        this.setState({activeAlbumSearch: searchTerm});
    }

    /**
     * Callback for when the order of albums is changed (as result of search change)
     * @param {*} albumNames the new order of album names
     */
    albumOrderChanged(albumNames) {
        this.setState({activeAlbumOrder: albumNames});
    }

    /**
     * Callback for when a search term is entered for photo search
     * @param {*} searchTerm the term entered for photo search
     */
    photoSearchMade(searchTerm) {
        this.setState({activePhotoSearch: searchTerm});
    }

     /**
     * Callback for when the order of photos is changed (as result of search change)
     * @param {*} albumNames the new order of photo urls
     */
    photoOrderChanged(photoURLs) {
        this.setState({activePhotoOrder: photoURLs});
    }

    /**
     * Triggers when the user moves an album, updates the involved albums from the database
     * @param {*} newAlbum the album to which the photo was moved
     * @param {*} oldAlbum the album from which the photo was moved
     */
    photoMoved(oldAlbum, newAlbum) {
        this.requestAlbum('All Photos');
        this.requestAlbum(oldAlbum);
        this.requestAlbum(newAlbum);
    }

    /**
     * Triggered when a dropzone upload occurs for live updating
     * @param {*} targetAlbum the album to which the photos were uploaded
     */
    dropUploadOccured(targetAlbum) {
        if (targetAlbum === "Albums") {
            alert("Select a target album before uploading files.");
            return;
        }

        this.requestAlbum('All Photos');
        this.requestAlbum(targetAlbum);
    }

    /**
     * Called when the user selects a new upload target album
     * @param {*} newTarget the name of the new target album
     */
    uploadTargetSelected(newTarget) {
        this.setState({uploadTargetAlbum: newTarget});
    }

    /**
     * Called when the user creates a new album
     * @param {*} newAlbumName the name of the new album
     */
    albumCreated(newAlbumName) {
        var activeAlbumOrder = this.state.activeAlbumOrder;
        var preservedAlbumOrder = this.state.preservedAlbumOrder;

        this.requestAlbum(newAlbumName);
    }

    /**
     * Called when the user finishes using the album creator to hide the modal
     */
    albumModalFinished() {
        if (this.state.showAlbumCreationModal) {
            this.setState({showAlbumCreationModal: false});
        }
    }

    /**
     * Displays the album creator on the create button click
     */
    createAlbumPrompt() {
        if (!this.state.showAlbumCreationModal) {
            this.setState({showAlbumCreationModal: true});
        }
    }
    
    /**
     * Displays the photo deletion pop up to the user
     */
    photoDeletionPrompt() {
        if (!this.state.showPhotoDeletionModal) {
            this.setState({showPhotoDeletionModal: true});
        }
    }

    /**
     * Called when the user completes the photo deletion process
     * @param {*} modifiedAlbums the albums modified by the user's photo deletion
     */
    deletePhotosDecisionComplete(modifiedAlbums) {
        this.setState({showPhotoDeletionModal: false, selectedPhotos: {}});

        // update the modified albums
        for (var key in modifiedAlbums) {
            var album = modifiedAlbums[key];

            // get updated album
            this.requestAlbum(album);
        }
    }
    
    /**
     * Called when the user clicks the button to begin the album deletion process
     */
    albumDeletionPrompt() {
        if (!this.state.showAlbumDeletionModal) {
            this.setState({showAlbumDeletionModal: true});
        }
    }

    /**
     * Called when the user finishes the album deletion process
     */
    deleteAlbumDecisionComplete(deletedAlbum) {
        this.setState({showAlbumDeletionModal: false});
        this.requestAlbum('All Photos');

        if (deletedAlbum) {
            var albums = this.state.albums;
            delete albums[deletedAlbum];

            var activeAlbumOrder = this.state.activeAlbumOrder;
            activeAlbumOrder.splice(activeAlbumOrder.indexOf(deletedAlbum), 1);

            var preservedAlbumOrder = this.state.preservedAlbumOrder;
            preservedAlbumOrder.splice(preservedAlbumOrder.indexOf(deletedAlbum), 1);

            var uploadTargetAlbum = this.state.uploadTargetAlbum;
            if (uploadTargetAlbum === deletedAlbum) {
                uploadTargetAlbum = preservedAlbumOrder.length > 0 ? preservedAlbumOrder[0] : "Albums";
            }

            this.setState({albums: albums, 
                activeAlbumOrder: activeAlbumOrder, 
                preservedAlbumOrder: preservedAlbumOrder,
                uploadTargetAlbum: uploadTargetAlbum});
        } else {
            console.log('No album was deleted.');
        }
    }

    render() {
        var albumStorageListProps = {
            searchTerm: this.state.activeAlbumSearch,
            preservedAlbumOrder: this.state.preservedAlbumOrder,
            albumNames: this.state.activeAlbumOrder,
            albums: this.state.albums,
            albumSelectedCallback: this.albumSelectedCallback,
            albumSearchMade: this.albumSearchMade,
            albumOrderChanged: this.albumOrderChanged,
            liveAlbum: this.state.liveAlbum,
            photoMoved: this.photoMoved
        }

        var albumPhotoListProps = {
            liveAlbum: this.state.liveAlbum,
            album: this.state.albums[this.state.liveAlbum],
            photoSearchMade: this.photoSearchMade,
            photoOrderChanged: this.photoOrderChanged,
            searchTerm: this.state.activePhotoSearch,
            preservedPhotoOrder: this.state.preservedPhotoOrder,
            activePhotoOrder: this.state.activePhotoOrder,
            albums: this.state.albums,
            photoSelected: this.photoSelected,
            selectedPhotos: this.state.selectedPhotos
        }

        var contentManagerProps = {
            albumNames: this.state.preservedAlbumOrder,
            dropUploadOccured: this.dropUploadOccured,
            uploadTargetAlbum: this.state.uploadTargetAlbum,
            uploadTargetSelected: this.uploadTargetSelected,
            createAlbumPrompt: this.createAlbumPrompt,
            photoDeletionPrompt: this.photoDeletionPrompt,
            albumDeletionPrompt: this.albumDeletionPrompt
        }

        var createAlbumProps = {
            showAlbumCreationModal: this.state.showAlbumCreationModal,
            albumCreated: this.albumCreated,
            albumModalFinished: this.albumModalFinished
        }

        var deletePhotosProps = {
            deletePhotosDecisionComplete: this.deletePhotosDecisionComplete,
            selectedPhotos: this.state.selectedPhotos,
            showPhotoDeletionModal: this.state.showPhotoDeletionModal,
            albums: this.state.albums
        }

        var deleteAlbumProps = {
            deleteAlbumDecisionComplete: this.deleteAlbumDecisionComplete,
            showAlbumDeletionModal: this.state.showAlbumDeletionModal,
            albums: this.state.albums
        }

        return (
            <div className="storage-root-div">
                <NavigationBar auth={this.props.auth} />
                <div className="data-lists">
                    <AlbumStorageList {...albumStorageListProps} />
                    <AlbumPhotoList {...albumPhotoListProps} />
                </div>
                <ContentManager className="content-manager" {...contentManagerProps} />
                <CreateAlbum {...createAlbumProps} />
                <DeletePhotosPopUp {...deletePhotosProps} />
                <DeleteAlbumPopUp {...deleteAlbumProps} />
            </div>
        );
    }
}

export default StoragePage;