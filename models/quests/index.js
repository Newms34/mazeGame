var mongoose = require('mongoose');
var qstSchema = new mongoose.Schema({
    name: String, //name of the item
    max: Number,
    min: Number,
    desc: String,
    status: String
},{collection: 'Quest'});

mongoose.model('Quest', qstSchema);