var mongoose = require('mongoose'),
    crypto = require('crypto');
//we're just testing password encryption here!
var usrSchema = new mongoose.Schema({
    name: String, //name of the user
    lvl: Number, //dungeon lvl
    playerLvl: { type: Number, default: 1 },
    currLvlXp: { type: Number, default: 0 },
    skillPts:Number,
    equip: {
        gold: Number, //how many munneez the user has
        head: [Number],
        chest: [Number],
        hands: [Number],
        legs: [Number],
        feet: [Number],
        weap: [Number],
        inv: [{
            lootType: { type: Number },
            item: [{ type: Number }],
            num: { type: Number }
        }]
    }, //equip just uses reference ids (nums) for now. may eventually switch this to mongo ids for increased speedibits. Note that each item will have THREE vals: a prefix, the item, and a suffix.
    pass: String,
    salt: String,
    questDone: [Number],
    inProg: [Number],
    currentLevel: {
        loc: String,
        data: [{}],
        names: [String]
    },
    prof:Number,
    skills:[Number],
    maxHp: Number,
    currHp: Number,
    mons:[String],//list of monsters discovered.
    maxEn: Number, //max energy (for skills)
    currEn: Number,
    currVotes:[String],//votes this user has.
    isStunned: Boolean //some skills can stun!
}, { collection: 'User' });

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function() {
    return crypto.randomBytes(16).toString('base64');
};


var encryptPassword = function(plainText, salt) {
    console.log('PASSWORD', plainText, salt)
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};
usrSchema.statics.generateSalt = generateSalt;
usrSchema.statics.encryptPassword = encryptPassword;
/*Note about methods, statics, and virtuals
A method exists on a single INSTANCE of a document in mongo. So the 'correct password' method 
below works on each specific user, not the user model as a whole!
A static is the opposite: it is called on the model as a whole.
Finally, a virtual describes a particular function effectively 'acts' like a property: it can be references as per normal mongo document properties (e.g., mongoose.model('MyModel').findOne({someVirtualProp:'potato'})). However, it doesn't actually EXIST in the schema, and the response that each document gives is generated on the spot by the virtuals fn. 
Another example: let's say you have a series of quests, each with a number of points. You could either update a 'totalpoints' field every time you save a new quest, or you could have a virtual that just grabs all of the points from every quest and spits out the sum.
*/
usrSchema.methods.correctPassword = function(candidatePassword) {
    console.log('this users condiments:', this.salt, 'and their pwd:', this.pass)
    return encryptPassword(candidatePassword, this.salt) === this.pass;
};
mongoose.model('User', usrSchema);
