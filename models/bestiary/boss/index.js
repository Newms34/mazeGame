var mongoose = require('mongoose');
var bossSchema = new mongoose.Schema({
    name: String, //name of the item
    max: Number,
    min: Number,
    desc: String,
    status: String
},{collection: 'Boss'});

mongoose.model('Boss', bossSchema);