var mongoose = require('mongoose');
var weapSchema = new mongoose.Schema({
    name: String, //name of the weap
    desc: String,
    max: Number, //min dmg
    min: Number, //max dmg
    def: Number, //normally 0. Some items give defense
    itemLvl: Number, //monsters only drop items at or below their 'personal' item lvl
    cost: Number, //cost. Sell price (player --> merch) is a fraction of this 
    imgUrl: String,
    num:Number
}, { collection: 'Weap' });
//note that weapons do NOT have a type, as this is provided by the particular attack used.
mongoose.model('Weap', weapSchema);
