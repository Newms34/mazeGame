var mongoose = require('mongoose');
var itemSchema = new mongoose.Schema({
    name: String, //name of the item
    item_id: Number, //id of item
    max: Number,
    min: Number,
    desc: String,
    status: String
},{collection: 'Item'});

mongoose.model('Item', itemSchema);