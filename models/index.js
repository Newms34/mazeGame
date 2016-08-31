var mongoose = require('mongoose');

var http = require('https');
require('./loot/weaps/');
require('./loot/armor/');
require('./loot/affixes/');
require('./bestiary/general/');
require('./bestiary/boss/');
require('./npcs/');
require('./quests/');
require('./users/');
require('./skills/')
console.log('Node Environment:', process.env.NODE_ENV)
if (!process.env.NODE_ENV || process.env.NODE_ENV != 'prod') {
    //just some quick env check. If we're developing locally, go ahead and use our local db. Otherwise, use the mlab db.
    mongoose.connect('mongodb://localhost:27017/mazeGame');
} else {
    mongoose.connect(process.env.MONGODB_URI);
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(e) {
    console.log('Database connected!')
})
