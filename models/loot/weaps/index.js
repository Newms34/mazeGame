var mongoose = require('mongoose');
var weapSchema = new mongoose.Schema({
    name: String, //name of the item
    max: Number,
    min: Number,
    desc: String,
    status: String
},{collection: 'Weap'});

mongoose.model('Weap', weapSchema);