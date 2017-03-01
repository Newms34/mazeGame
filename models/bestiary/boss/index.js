var mongoose = require('mongoose');
var bossSchema = new mongoose.Schema({
    name: String, //name of the boss
    quest: Number, //bosses ALWAYS spawn via a quest (it's how they're different from normal monsters)
    lvl: Number, //used to determine what items this creature will drop. Bosses drop items up to 3(?) lvls higher than their normal lvl
    desc: String,
    min: Number,//min and max damage (range)
    max: Number, //should we have some 'boss damage multiplier'?
    type: Number, //dmg type
    res:[Number],//resistance(s). creatures w/ resist to a particular dmg type take 30-50% less dmg from attacks of that dmg type
    hp:Number, //total (max) hp.
    imgUrl:String,
    id:Number
},{collection: 'Boss'});

mongoose.model('Boss', bossSchema);