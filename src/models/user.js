var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: String,
    password: String
});

var options = {
    usernameLowerCase: true
};

User.plugin(passportLocalMongoose, options);

module.exports = mongoose.model('User', User);