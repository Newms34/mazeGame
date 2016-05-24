var mongoose = require('mongoose');
var usrSchema = new mongoose.Schema({
    name: String, //name of the user
    lvl: Number,
    equip: {
        head: Number,
        chest: Number,
        hands: Number,
        legs: Number,
        feet: Number,
        lHand: Number,
        rHand: Number,
        inv:[Number]
    }, //equip just uses reference ids (nums) for now. may eventually switch this to mongo ids for increased speedibits
    pass: String,
    questDone: [Number],
    inProg: [{
        id: Number,
        status: Number
    }],
    maxHp:Number,
    currHp:Number,
    maxEn:Number,//max energy (for skills)
    currEn:Number
}, { collection: 'User' });
//note that storing your password as a string is a VERY BAD IDEA! I'm only doin this for sake of ease, but eventually we'll wanna use something better (like google auth, passport.js, etc)
mongoose.model('User', usrSchema);
