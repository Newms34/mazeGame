var mongoose = require('mongoose');
var affSchema = new mongoose.Schema({
	pre:String,
	post:String,
	stunCh:Number,
    dmgType: Number, //damage type number. usually gonna be -1 (no change),
    novaType: Number,
    novaChance: Number, //this and the following are usually 0, and are CHANCES for an effect to occur
    conf: Number,
    vamp: Number,
    crue: Number,
    brut: Number,
    bene: Number,
    rejuv: Number,
    defChanges: {
        phys: Number, //these ones are either -1 (more dmg taken), 0 (no effect, default), or 1 (less dmg taken)
        fire: Number,
        ice: Number,
        pois: Number,
        dark: Number,
        holy:Number
    },
    num:Number
}, { collection: 'Affix' });
mongoose.model('Affix', affSchema);
