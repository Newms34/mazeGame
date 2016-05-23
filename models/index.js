var mongoose = require('mongoose'),
    https = require('https'),
    Weap = require('./loot/weaps/'),
    Arm = require('./loot/armor/'),
    Mons = require('./bestiary/general/'),
    Boss = require('./bestiary/boss/'),
    Npc = require('./npcs/'),
    Qst = require('./quests/'),
    User = require('./users/');
if (process.env.NODE_ENV && process.env.NODE_ENV == 'development') {
    //just some quick env check. If we're developing locally, go ahead and use our local db. Otherwise, use the mlab db.
    mongoose.connect('mongodb://localhost:27017/mazeGame');
} else {
    mongoose.connect('mongodb://newms34:mrdpn3450@ds021711.mlab.com:21711/heroku_hf915bgq');
}
var db = mongoose.connection;

//current items: cores/lodestones, t5/t6 fine, ascended mats
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(e) {
    console.log('Database connected!')
})

module.exports = {
    "Weap": Weap,
    "User": User,
    "Mons": Mons,
    "Arm": Arm,
    "Boss":Boss,
    "Npc":Npc,
    "Qst":Qst,
    "User":User
};
