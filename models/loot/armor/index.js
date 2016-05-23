var mongoose = require('mongoose');
var armorSchema = new mongoose.Schema({
    name: String, //name of the armor piece
    def: Number,
    desc: String,
    res: [Number],//armor resistances (if any!)
    cost:Number,
    lvl:Number,
    imgUrl:String
},{collection: 'Armor'});

mongoose.model('Armor', armorSchema);