var mongoose = require ("mongoose");

mongoose.Promise = global.Promise;

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring =
process.env.MONGODB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost:27017/database';

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

var mongoDB = mongoose.connection;

mongoDB.on('error', console.error.bind(console, 'connection error:'));

mongoDB.once('open', function callback () {
    console.log('Connected To Mongo Database');
});

module.exports = mongoDB;