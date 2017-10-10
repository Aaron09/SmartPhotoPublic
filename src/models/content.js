var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contentSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    userAlbums: {
        type: Schema.Types.Mixed,
        required: true
    }
}, { minimize: false });

module.exports = contentSchema;