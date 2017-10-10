
import Encoder from "./components/encoder";

/**
 * Class for handling interactions with the mongo database
 */
var DBHandler = function() {

    const CONTENTS_COLLECTION_NAME = 'contents';
    const SUCCESS_CODE = 200;

    var AWS = require('aws-sdk');
    var s3 = new AWS.S3();
    var userstorageBucket = 'smartphoto-storage-bucket';
    var fs = require('fs');

    /**
     * Gets an album and its data from MongoDB
     */
    this.getAlbum = function(albumName, username, mongoDB, albumCallback) {
        var contentsCollection = mongoDB.collection(CONTENTS_COLLECTION_NAME);

        contentsCollection.findOne({username: username}, function(err, userContent) {
            if (err || userContent == null) {
                console.log(err);
                return;
            }

            albumCallback(err, userContent.userAlbums[albumName.replace(/%20/g, ' ')]);
        });
    }

    /**
     * Saves a single photo's data to the mongo database
     * @param {*} photoURL the url of the photo on the server
     * @param {*} editHistory the edit history of the photo
     * @param {*} albumName the name of the album to which the photo belongs
     */
    this.savePhoto = function(photoPath, photoEditHistory, username, albumName, mongoDB) {

        var encodedPhotoPath = Encoder.encodeKey(photoPath);

        var userPhoto = {
            editHistory: [],
            parentAlbum: albumName
        }

        var contentsCollection = mongoDB.collection(CONTENTS_COLLECTION_NAME);

        contentsCollection.findOne({username: username}, function(err, userContent) {
            if (err || userContent == null) {
                console.log(err);
                return;
            }

            this.updateAlbumWithPhoto(encodedPhotoPath, userPhoto, albumName, userContent);
            
            contentsCollection.update({username: username}, userContent);
        }.bind(this));
    }

    /**
     * Adds a photo to a user's album or updates the existing photo
     */
    this.updateAlbumWithPhoto = function(photoURL, photo, albumName, userContent) {
        // if the photo already exists, we overwrite the edit history and have already written
        // the changes to the existing url. IN FINAL PROD WE WANT TO SAVE SOURCE AND 
        // MOST RECENTLY EDITED VERSION SO USER CAN REVERT TO ORIGINAL
        if (photoURL in userContent.userAlbums[albumName]) {
            userContent.userAlbums[albumName][photoURL].editHistory = photo.editHistory;
            userContent.userAlbums["All Photos"][photoURL].editHistory = photo.editHistory;
        } else {
            userContent.userAlbums[albumName][photoURL] = photo;
            userContent.userAlbums["All Photos"][photoURL] = photo;

            userContent.userAlbums[albumName]["size"] += 1;
            userContent.userAlbums["All Photos"]["size"] += 1;
        }
    }

    /**
     * Gets all of the photos from a particular album of a user
     */
    this.getPhotosFromAlbum = function(username, albumName, mongoDB, albumPhotosCallback) {
        
        var contentsCollection = mongoDB.collection(CONTENTS_COLLECTION_NAME);

        contentsCollection.findOne({username: username}, function(err, userContent) {
            
            var albumPhotos = {
                photoData: userContent.userAlbums[albumName]
            };

            albumPhotosCallback(err, albumPhotos);
        }.bind(this));
    }

    /**
     * Returns a list of all of the photo URLs belonging to a certain user
     */
    this.getAllPhotos = function(username, mongoDB, getPhotosCallback) {

        var photoDataList = [];
        var contentsCollection = mongoDB.collection(CONTENTS_COLLECTION_NAME);

        contentsCollection.findOne({username: username}, function(err, userContent) {

            if (err) {
                console.log(err);
                return;
            } else if (userContent == null) {
                console.log('User not found.');
                return;
            }

            getPhotosCallback(err, userContent.userAlbums["All Photos"]);
        }.bind(this));
    }

    /**
     * Gets a current users list of albums
     */
    this.getAlbums = function(username, mongoDB, getAlbumsCallback) {

        var contentsCollection = mongoDB.collection(CONTENTS_COLLECTION_NAME);
        contentsCollection.findOne({username: username}, function(err, userContent) {

            var userAlbums = {
                albums: userContent == null ? null : userContent.userAlbums
            };

            getAlbumsCallback(err, userAlbums);
        });
    }

    /**
     * Creats an album specified by the user in the database
     */
    this.createAlbum = function(albumName, username, mongoDB, handleAlbumCreationCallback) {

        var contentsCollection = mongoDB.collection(CONTENTS_COLLECTION_NAME);

        contentsCollection.findOne({username: username}, function(err, userContent) {
            if (err || userContent == null) {
                console.log('ERROR: ' + err);
                return;
            }

            var obj = username + '/albums/' + albumName + '/';
            var params = {Bucket: userstorageBucket, Key: obj, Body: "NA"};
            s3.upload(params, function (err, data) {
                if (err) {
                    console.log("Error creating the folder: ", err);
                } else {
                    console.log("Successfully created a folder on S3");
                }
            });

            userContent.userAlbums[albumName] = {size: 0};
            contentsCollection.update({username: username}, userContent);

            handleAlbumCreationCallback(SUCCESS_CODE);

        }.bind(this));
    }

    /**
     * Function for moving a photo from one album to another
     */
    this.movePhoto = function(photoPath, oldAlbum, newAlbum, username, mongoDB, moveCallback) {

        var contentsCollection = mongoDB.collection(CONTENTS_COLLECTION_NAME);

        contentsCollection.findOne({username: username}, function(err, userContent) {
            if (err || userContent == null) {
                console.log('DATABASE ERROR: ' + err);
                moveCallback(500);
                return;
            }
            var encodedOldPath = Encoder.encodeKey(photoPath);
            var photoData = userContent.userAlbums[oldAlbum][encodedOldPath];

            // change the url of the file to be the new album instead of the old album
            var newPhotoPath = photoPath.substring(0, photoPath.indexOf(oldAlbum)) + newAlbum + photoPath.substring(photoPath.indexOf(oldAlbum) + oldAlbum.length);

            // set the new data of the photo in the new album
            var encodedNewPath = Encoder.encodeKey(newPhotoPath);
            userContent.userAlbums[newAlbum][encodedNewPath] = photoData;
            userContent.userAlbums[newAlbum][encodedNewPath].parentAlbum = newAlbum;
            userContent.userAlbums[newAlbum]['size'] += 1;

            // update all photos with the url and parent album change
            delete userContent.userAlbums['All Photos'][encodedOldPath];
            userContent.userAlbums['All Photos'][encodedNewPath] = userContent.userAlbums[newAlbum][encodedNewPath];

            var photoName = photoPath.substring(photoPath.indexOf(oldAlbum) + oldAlbum.length + 1);

            // physically move the file
            var copyParams = {
                Bucket: userstorageBucket,
                Key: username + '/albums/' + newAlbum + '/' + photoName,
                CopySource: photoPath
            };

            s3.copyObject(copyParams, function(err, data) {    
                if (err) {
                    console.log(err);
                } else {
                    var deleteParam = {
                        Bucket: userstorageBucket,
                        Key: photoPath
                    };
                    s3.deleteObject(deleteParam, function(err, data) {
                        if (err) {
                            console.log(err);
                        }
                        moveCallback(200);
                    });
                }
            });

            // remove the photo data from the old album
            delete userContent.userAlbums[oldAlbum][encodedOldPath];
            userContent.userAlbums[oldAlbum]['size'] -= 1; 

            contentsCollection.update({username: username}, userContent);
        });
    }

    /**
     * Function for uploading a file to amazon s3
     */
    this.uploadFile = function(file, awsPath, username, albumName, photoEditHistory, mongoDB, responseCallback) {
        var fileBuffer = fs.readFileSync(file.path);

        var params = {
            Bucket: userstorageBucket,
            Key: awsPath, 
            Body: fileBuffer,
            ContentType: file.mimetype
        };
        s3.upload(params, function (err, data) {
            if (err) {
                console.log(err);
            }

            // delete the temp file
            fs.unlink(file.path, function (err) {
                if (err) {
                    console.error(err);
                }
                console.log('Temp File Delete');
            });
            var photoPath = 'https://s3.amazonaws.com/smartphoto-storage-bucket/' + 
                username + '/albums/' +
                albumName + '/' + file.originalname;

            this.savePhoto(photoPath, photoEditHistory, username, albumName, mongoDB);
            responseCallback(SUCCESS_CODE, photoPath);
        }.bind(this));
    }
}

module.exports = DBHandler; 