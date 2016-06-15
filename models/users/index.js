var mongoose = require('mongoose'),
    passBits = require('password-hash-and-salt'),
    crypto = require('crypto');
//we're just testing password encryption here!
var tempUsr = {};
passBits('potato').hash(function(err, hash) {
    console.log('err is', err, ' and hash is ', hash)
    tempUsr.hash = hash;
    console.log('Now we are gonna try to verify that pwd')
    passBits('potato').verifyAgainst(tempUsr.hash, function(e, v) {
        console.log('potato: Err is ', e, 'and verified status is', v)
    })
    passBits('tomato').verifyAgainst(tempUsr.hash, function(e, v) {
        console.log('tomato: Err is ', e, 'and verified status is', v)
    })
})
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
        inv: [Number]
    }, //equip just uses reference ids (nums) for now. may eventually switch this to mongo ids for increased speedibits
    pass: String,
    salt: String,
    questDone: [Number],
    inProg: [{
        id: Number,
        status: Number
    }],
    maxHp: Number,
    currHp: Number,
    maxEn: Number, //max energy (for skills)
    currEn: Number,
    isStunned: Boolean //some skills can stun!
}, { collection: 'User' });

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function() {
    return crypto.randomBytes(16).toString('base64');
};


var encryptPassword = function(plainText, salt) {
    console.log('PASSWORD',plainText,salt)
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};
usrSchema.statics.generateSalt = generateSalt;
usrSchema.statics.encryptPassword = encryptPassword;
usrSchema.method('correctPassword', function(candidatePassword) {
    console.log('this users condiments:',this.salt,'and their pwd:',this.pass)
    return encryptPassword(candidatePassword, this.salt) === this.pass;
});


mongoose.model('User', usrSchema);
