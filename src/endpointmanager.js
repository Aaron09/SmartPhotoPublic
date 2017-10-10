

/**
 * Class for serving and handling interactions based on the endpoint reached by a user
 */
var EndpointManager = function() {

    const SUCCESS_CODE = 200;
    const INTERNAL_ERROR = 500;
    const OTHER_ERROR = 400;

    var fs = require('fs');
    var AWS = require('aws-sdk');
    var s3 = new AWS.S3();
    var userstorageBucket = 'smartphoto-storage-bucket';

    var DBHandler = require('./dbhandler');
    var dbHandler = new DBHandler();

    this.handleGetSingleAlbum = function(request, username, mongoDB, albumCallback) {
        var albumName = request.url.substring(request.url.indexOf('albums/'));
        albumName = albumName.substring(albumName.indexOf('/') + 1);

        dbHandler.getAlbum(albumName, username, mongoDB, function(error, albumData) {
            albumCallback(error, albumData);
        });
    }

    this.createAlbum = function(request, username, mongoDB, albumCreationCallback) {

        var albumName = request.body.albumName;

        dbHandler.createAlbum(albumName, username, mongoDB, function(responseCode) {
            albumCreationCallback(responseCode);
        });
    }

    /**
     * Gets all of the photos from a specific album of a user
     */
    this.handleGetPhotosFromAlbum = function(request, username, mongoDB, handleAlbumPhotos) {
        var fullURL = request.url;
        var albumName = fullURL.substring(fullURL.indexOf('albumPhotos/'));
        albumName = albumName.substring(albumName.indexOf('/') + 1);

        dbHandler.getPhotosFromAlbum(username, albumName, mongoDB, function(error, response) {
            handleAlbumPhotos(error, response);
        });
    }

    /**
     * Gets all of the albums belonging to a certain user
     */
    this.handleGetAlbums = function(request, username, mongoDB, handleAlbums) {
        dbHandler.getAlbums(username, mongoDB, function(error, response) {
            handleAlbums(error, response);
        });
    }

    /**
     * Gets all of the photo urls stored by a user
     * @param {*} request the get request of the user
     * @param {*} username the username of the current user
     * @param {*} mongoDB the current mongoDB reference
     */
    this.handleGetAllPhotos = function(request, username, mongoDB, handlePhotos) {
        dbHandler.getAllPhotos(username, mongoDB, function(error, response) {
            handlePhotos(error, response);
        });
    }

    /**
     * Receives an upload file post request and returns the status code for sucess or failure
     * @param {*} request the post request from the user
     */
    this.handleUpload = function(request, username, mongoDB, responseCallback) {
        if (request.body == undefined) {
            responseCallback(OTHER_ERROR);
        }

        var uploadFile = request.files[0];

        const photoEditHistory = request.body.editHistory;
        const albumName = request.body.albumName;

        var awsPath = username + '/albums/' + albumName + '/' + uploadFile.originalname;

        fs.readFile(uploadFile.path, function (err, data) {
            if (err) {
                console.log(err);
                responseCallback(500, "");
                return;
            }
            var params = {
                Bucket: userstorageBucket,
                Key: awsPath, 
                Body: data
            };
            s3.upload(params, function (err, data) {
                // delete the temp file
                fs.unlink(uploadFile.path, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('Temp File Delete');
                });
                var photoPath = 'https://s3.amazonaws.com/smartphoto-storage-bucket/' + 
                    username + '/albums/' +
                    albumName + '/' + uploadFile.originalname;

                dbHandler.savePhoto(photoPath, photoEditHistory, username, albumName, mongoDB);
                responseCallback(SUCCESS_CODE, photoPath);
            });
        });
    }.bind(this);

    this.handleMovePhoto = function(photoPath, oldAlbum, newAlbum, username, mongoDB, moveCallback) {
        dbHandler.movePhoto(photoPath, oldAlbum, newAlbum, username, mongoDB, function(responseCode) {
            moveCallback(responseCode);
        });
    }
}

module.exports = EndpointManager;