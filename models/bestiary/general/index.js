var mongoose = require('mongoose');
var monSchema = new mongoose.Schema({
    name: String, //name of the item
    max: Number,
    min: Number,
    desc: String,
    status: String
},{collection: 'Mon'});

mongoose.model('Mon', monSchema);