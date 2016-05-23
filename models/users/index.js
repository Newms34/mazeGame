var mongoose = require('mongoose');
var usrSchema = new mongoose.Schema({
    name: String, //name of the item
    lvl: Number,
    equip: {
    	
    },
    pass: String
},{collection: 'User'});
//note that storing your password as a string is a VERY BAD IDEA! I'm only doin this for sake of ease, but eventually we'll wanna use something better (like google auth, passport.js, etc)
mongoose.model('User', usrSchema);