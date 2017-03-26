var mongoose = require('mongoose');
//Each item in vote will last for a certain period of time. After this time is elapsed, it'll either be accepted or rejected.
var voteSchema = new mongoose.Schema({
    type: Number, //0: weap, 1: armor, 2: skill
    vid: String, //identifier
    votedUsrs: [String],
    votes: [{
        type: Number,
        default: 0
    }],
    votesOpen: { type: Boolean, default: true },
    startTime: Number, //while a date would be the expected type here, I'm using a unix timestamp (getTime()) so that we can simply check it against a maxDif fn. 
    skill: {
        name: String, //name of the armor piece
        desc: String, //Description of skill
        energy: Number,
        heal: Number, //burst heal amount (if any)
        regen: Number, //heal per turn (if any)
        burst: Number, //burst (single turn) damage
        degen: Number, //DoT damage (per turn)
        type: Number, //damage type.
        stuns: Boolean,
        imgUrl: String,//dataUrl!
        id: Number, //id number of skill
        prevSkill: { type: Number, default: 0 }, //for skill tree. If zero, this is a base skill (and thus has no required prev skill). Otherwise, id of prerequisite skill.
        nextSkills: [], //for skill tree. Array of possible next skills user may choose from this skill 
        skillPts: { type: Number, default: 0 }, //number of skill points required to purchase this skill
        extraFx: {
            dmgVsStun: { type: Boolean, default: false },
            protection: { type: Boolean, default: false },
            dmgVsDegen: { type: Boolean, default: false },
            critChance: { type: Boolean, default: false }
        }
    },
    armor: {
        name: String,
        def: Number,
        desc: String,
        res: [Number],
        cost: Number,
        itemLvl: Number,
        slot: Number,
        num: Number,
        heavy: { type: Boolean, default: false }
    },
    weap: {
        name: String,
        def: Number,
        desc: String,
        min: Number,
        max: Number,
        itemLvl: Number,
        cost: Number,
        num: Number
    }
}, { collection: 'Vote' });

mongoose.model('Vote', voteSchema);
