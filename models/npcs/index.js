var mongoose = require('mongoose');
var npcSchema = new mongoose.Schema({
    name: String, //name of the item
    max: Number,
    min: Number,
    desc: String,
    status: String
},{collection: 'Npc'});

mongoose.model('Npc', npcSchema);