// disable CSS for server representation of components
process.env.BROWSER = false;

import path from 'path'; 
import { Server } from 'http';
import Express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from './routes';
import RootImageEditor from "./components/rootimageeditor";
import NotFoundPage from './components/notfoundpage';
import Encoder from "./components/encoder";

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var rimraf = require('rimraf');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var userstorageBucket = 'smartphoto-storage-bucket';

var mongoDB = require('./mongoconnection');
var mongoose = require('mongoose');

var ContentSchema = require('./models/content');
var Content = mongoose.model('Content', ContentSchema);

var EndpointManager = require('./endpointmanager');
const endpointManager = new EndpointManager();
var DBHandler = require('./dbhandler');
const dbHandler = new DBHandler();

var multer  = require('multer');
var upload = multer({ dest: 'tmp/', limits: { fileSize: 5 * 1024 * 1024}}); // 5mb file size limit

"use strict";

// initialize server
const app = new Express();
const server = new Server(app);

// static assets folder
app.use(Express.static(path.join(__dirname, 'static')));

// post data parsing
app.use(bodyParser.urlencoded({
    extended: true
}));

// photo size upload limit
app.use(bodyParser.json({limit: '5mb'}));

app.use(cookieParser());

app.use(require('express-session')({
    secret: 'tpo0809m',
    resave: true,
    saveUninitialized: false
}));

// initialize passport for user authentication
app.use(passport.initialize());
app.use(passport.session());

var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// start the server
const port = process.env.PORT || 27017;
const env = process.env.NODE_ENV || 'production';
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on: ` + port + ' in: ' + env);
});

// serve all get endpoints the index.html, React handles routing
app.get('*', (req, res, next) => {

  if (req.url === '/userstorage/allPhotos') {

    // get all of the photos belonging to a user
    endpointManager.handleGetAllPhotos(req, req.user.username.toLowerCase(), mongoDB, function(error, response) {
      if (error) {
        console.log(error);
      }
      res.json(response);
      res.end();
    });

  } else if (req.url === '/userstorage/albums') {

    // get the list of albums of a user
    endpointManager.handleGetAlbums(req, req.user.username.toLowerCase(), mongoDB, function(error, response) {
      if (error) {
        console.log(error);
      }
      res.json(response);
      res.end();
    });
  } else if (req.url.indexOf('/userstorage/albums/') !== -1) {
    // get a specific album
    endpointManager.handleGetSingleAlbum(req, req.user.username.toLowerCase(), mongoDB, function(error, response) {
      if (error) {
        console.log(error);
      }
      res.json(response);
      res.end();
    });

  } else if (req.url.indexOf('/userstorage/albumPhotos/') !== -1) {

    // get all of the photos in a certain album of a user
    endpointManager.handleGetPhotosFromAlbum(req, req.user.username.toLowerCase(), mongoDB, function(error, response) {
      if (error) {
        console.log(error);
      }
      res.json(response);
      res.end();
    });


  } else if (req.url.indexOf('/userstorage/') !== -1) {    
    
    // get specific user image  
    var imagePath = path.resolve("." + req.url);
    res.sendFile(path.resolve(imagePath));

  } else {
    
    // serve UI  
    res.sendFile(path.resolve(__dirname + '/static/index.html'));
  }
});

// upload photo from editor
app.post('/edit/upload', upload.any(), (req, res) => {
  var username = req.user.username.toLowerCase();
  var contentsCollection = mongoDB.collection('contents');
  contentsCollection.findOne({username: username}, function(err, userContent) {
    // user's can only store a max of 100 photos
    if (userContent.userAlbums['All Photos']['size'] >= 10) {
      console.log('Err' + err);
      return;
    }
    endpointManager.handleUpload(req, username, mongoDB, function(responseCode, url) {
      if (responseCode === 200) {
          res.write(url);
      }
      res.status(responseCode);
      res.end();
    });
  });
});

// create album from editor
app.post('/create/album', (req, res) => {
  endpointManager.createAlbum(req, req.user.username.toLowerCase(), mongoDB, function(responseCode) {
    res.sendStatus(responseCode);
  })
});

// register user
app.post('/signup', function(req, res) {
  var fixedUsername = req.body.username.toLowerCase();
  User.register(new User({ username : fixedUsername}), req.body.password, function(err, user) {
    if (err) {
      return res.sendStatus(400);
    }

    // create folder on S3 for user file storage 
    var obj = fixedUsername + '/albums/';
    var params = {Bucket: userstorageBucket, Key: obj, Body: "NA"};
    s3.upload(params, function (err, data) {
      if (err) {
        console.log("Error creating the folder: ", err);
      } else {
        console.log("Successfully created a folder on S3");
      }
    });

    // all users receive a default album that holds all of their photos
    var allPhotos = "All Photos";

    var newUser = new Content({
        username: fixedUsername,
        userAlbums: {[allPhotos]: {size: 0}}
    });

    newUser.save(function(err) {
      if (err) {
        console.log(err);
      }
    });

    passport.authenticate('local')(req, res, function () {
      res.sendStatus(200);
    });
  });
});

// login user
app.post('/login', function(req, res) {
  passport.authenticate('local')(req, res, function() {
    res.sendStatus(200);
  });
});

// logout user
app.post('/logout', function(req, res) {
  req.logout();
  res.sendStatus(200);
});

// user moves a photo from one album to another
app.post('/storage/move', function(req, res) {
  endpointManager.handleMovePhoto(req.body.url, req.body.oldAlbum, req.body.newAlbum, req.user.username.toLowerCase(), mongoDB, function(responseCode) {
    res.sendStatus(responseCode);
  });
});

// user uploads in dropzone
app.post('/dropupload/*', upload.any(), function(req, res) {

  var username = req.user.username;
  var destAlbum = req.url.substring(req.url.indexOf('dropupload/') + 11);

  if (destAlbum === "Albums") {
    res.sendStatus(400);
    return;
  }

  var albumPath = './userstorage/' + username + '/albums/' + destAlbum;
  var contentsCollection = mongoDB.collection('contents');

  // update data in database
  contentsCollection.findOne({username: username}, function(err, userContent) {
    // user's can only store a max of 100 photos
    console.log(userContent.userAlbums['All Photos']['size']);
    if (err || userContent == null || userContent.userAlbums['All Photos']['size'] >= 10) {
      console.log('ERR: ' + err);
      res.sendStatus(400);
      return;
    }

    var successfulUploads = 0;
    for (var i = 0; i < req.files.length; i++) {
      var file = req.files[i];
      var path = albumPath + '/' + file.originalname;      

      var awsPath = username + '/albums/' + destAlbum + '/' + file.originalname;
      var photoData = {
        editHistory: [],
        parentAlbum: destAlbum
      }
      dbHandler.uploadFile(file, awsPath, username, destAlbum, [], mongoDB, function() {
        successfulUploads += 1;
        if (successfulUploads === req.files.length) {
          contentsCollection.update({username: username}, userContent);
          res.sendStatus(200);
        }
      });
    }
  });
});

// user deletes photos from storage page
app.post('/storage/photos/delete', function(req, res) {
  
    var photoURLs = req.body.photos;

    var username = req.user.username;
    var contentsCollection = mongoDB.collection('contents');

    contentsCollection.findOne({username: username}, function(err, userContent) {
      if (err || userContent == null) {
        console.log('ERR: ' + err);
        return;
      }
      var successfulDeletions = 0;

      // delete the photo from all photos, it's parent album, and decrement the size of both
      for (var i = 0; i < photoURLs.length; i++) {
        var currentPhoto = Encoder.encodeKey(photoURLs[i]);
        var album = userContent.userAlbums['All Photos'][currentPhoto].parentAlbum;

        delete userContent.userAlbums['All Photos'][currentPhoto];
        delete userContent.userAlbums[album][currentPhoto];

        userContent.userAlbums['All Photos']['size'] -= 1;
        userContent.userAlbums[album]['size'] -= 1;

        // remove file from storage directory in S3
        var decodedPath = Encoder.decodeKey(currentPhoto);
        var filePath = username + '/albums/' + album + '/' + decodedPath.substring(decodedPath.indexOf(album) + album.length + 1);
        var deleteParam = {
          Bucket: userstorageBucket,
          Key: filePath
        };
        s3.deleteObject(deleteParam, function(err, data) {
            if (err) {
                console.log(err);
            }
            successfulDeletions += 1;

            if (successfulDeletions === photoURLs.length) {
              res.sendStatus(200);
            }
        });
      }

      contentsCollection.update({username: username}, userContent);
    });
});

// user deletes an album from the storage page
app.post('/storage/album/delete', function(req, res) {

  var albumName = req.body.albumName;
  var username = req.user.username;
  var contentsCollection = mongoDB.collection('contents');

  contentsCollection.findOne({username: username}, function(err, userContent) {
    if (err || userContent == null) {
      console.log('ERR: ' + err);
      return;
    }

    // need to delete the specific photos from All Photos as well
    var successfulDeletions = 0;
    var photoNames = Object.keys(userContent.userAlbums[albumName]);

    var empty = (photoNames.length === 1);

    for (var photoIndex in photoNames) {
      var currentPhoto = photoNames[photoIndex];

      if (currentPhoto !== "size") {
        delete userContent.userAlbums['All Photos'][currentPhoto];
        userContent.userAlbums['All Photos']['size'] -= 1; 

        var decodedPhoto = Encoder.decodeKey(currentPhoto);
        var photoName = decodedPhoto.substring(decodedPhoto.indexOf(albumName) + albumName.length + 1);
        var path = username + '/albums/' + albumName + '/' + photoName; 
        var deleteParam = {
          Bucket: userstorageBucket,
          Key: username + '/albums/' + albumName + '/' + photoName
        }
        if (!empty) {
          s3.deleteObject(deleteParam, function(err, data) {
            if (err) {
              console.log(err);
            }
            successfulDeletions += 1;
            if (successfulDeletions === photoNames.length - 1) {
              var albumDeleteParam = {
                Bucket: userstorageBucket,
                Key: username + '/albums/' + albumName + '/'
              }
              s3.deleteObject(albumDeleteParam, function(err, data) {
                if (err) {
                  console.log(err);
                }
                res.sendStatus(200);
              });
            }
          });
        }
      }
    }

    // delete the album in MongoDB
    delete userContent.userAlbums[albumName];

    contentsCollection.update({username: username}, userContent);

    if (empty) {
      var albumDeleteParam = {
        Bucket: userstorageBucket,
        Key: username + '/albums/' + albumName + '/'
      }
      s3.deleteObject(albumDeleteParam, function(err, data) {
        if (err) {
          console.log(err);
        }
        res.sendStatus(200);
      });
    }
  });
});

// endpoint for receiving image edit changes
app.post('/edit/save', upload.any(), function(req, res) {

  // variable initialization
  var username = req.user.username;

  var destAlbum = req.body.albumName;
  var imageName = req.body.imageName;
  var imagePath = req.body.imagePath;
  var editHistory = req.body.editHistory;
  var awsPath = username + '/albums/' + destAlbum + '/' + imageName;
  var localPath = 'tmp/' + username + '/' + imageName;

  var contentsCollection = mongoDB.collection('contents');
  contentsCollection.findOne({username: username}, function(err, userContent) {

    userContent.userAlbums[destAlbum][Encoder.encodeKey(imagePath)].editHistory = editHistory;
    contentsCollection.update({username: username}, userContent);

    // make local file and upload to S3, 
    // local file is automatically is removed by Heroku after request completes
    if (!fs.existsSync('tmp/' + username)) {
      fs.mkdirSync('tmp/' + username);
    }
  
    var imageFile = req.files[0];
    var data = fs.readFileSync(imageFile.path);

    var params = {
      Bucket: userstorageBucket,
      Key: awsPath,
      Body: data
    }

    s3.upload(params, function(err, data) {
      if (err) {
        console.log(err);
      }

      res.sendStatus(200);
    })
  });
});
