var mongoose = require('mongoose');
var weapSchema = new mongoose.Schema({
    name: String, //name of the weap
    max: Number, //min dmg
    min: Number, //max dmg
    def: Number, //normally 0. Some items give defense
    type: String, //dmg type
    itemLvl: Number, //monsters only drop items at or below their 'personal' item lvl
    cost: Number, //cost. Sell price (player --> merch) is a fraction of this 
    imgUrl:String,  
}, { collection: 'Weap' });

mongoose.model('Weap', weapSchema);
