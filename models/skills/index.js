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
    stuns:Boolean,
    imgUrl:String,
    id:Number,//id number of skill
    prevSkill:{type:Number, default:0},//for skill tree. If zero, this is a base skill (and thus has no required prev skill). Otherwise, id of prerequisite skill.
    nextSkills:[Number],//for skill tree. Array of possible next skills user may choose from this skill 
    skillPts:{type:Number, default:0}//number of skill points required to purchase this skill
},{collection: 'Skill'});

mongoose.model('Skill', skillSchema);