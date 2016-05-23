var mongoose = require('mongoose');
var armorSchema = new mongoose.Schema({
    name: String, //name of the item
    max: Number,
    min: Number,
    desc: String,
    status: String
},{collection: 'Armor'});

mongoose.model('Armor', armorSchema);