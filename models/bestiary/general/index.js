var mongoose = require('mongoose');
var monSchema = new mongoose.Schema({
    name: String, //name of the creature
    lvl: Number, //used to determine what items this creature will drop.
    desc: String,
    min: Number,
    max: Number, 
    en:{type:Number,default:0},//total energy this creature has
    enPerAttack:{type:Number,default:0},//energy required each time this creature attacks. Note that this is not 'used' per turn, unlike the player. Instead, the attack AI checks each turn to see if the creature has enough energy to attack
    type: Number, //dmg type
    res:[Number],//resistance(s). creatures w/ resist to a particular dmg type take 30-50% less dmg from attacks of that dmg type
    hp:Number, //total (max) hp.
    imgUrl:String, //picture!
    stunCh:Number,//Chance for creature to stun. Usually zero
    healCh:Number,//Chance for creature to heal with each attack
},{collection: 'Mon'});

mongoose.model('Mon', monSchema);