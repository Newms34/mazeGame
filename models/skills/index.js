var mongoose = require('mongoose');
var skillSchema = new mongoose.Schema({
    name: String, //name of the armor piece
    desc: String, //Description of skill
    energy:Number,
    heal: Number, //burst heal amount (if any)
    regen: Number,//heal per turn (if any)
    burst: Number,//burst (single turn) damage
    degen: Number,//DoT damage (per turn)
    type:Number, //damage type.
    imgUrl:String
},{collection: 'Skill'});

mongoose.model('Skill', skillSchema);