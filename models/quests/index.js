var mongoose = require('mongoose');
//I'm really not sure about the format for quests yet. So this all is probly gonna change pretty Jurassically
var qstSchema = new mongoose.Schema({
    name: String, //name of the quest
    id: Number,
    steps: [{
        txt: String,
        stepNum: Number,
        monsGoal: Number,
        itGoal: Number
    }],//for now, steps will be a bunch of things like "go kill X" or "go get a Y".
    desc: String,//Description of the quest
    lvl: Number,
    giver: Number //we may not need both giver AND lvl, since the giver should only give the quest at an appropriate lvl
}, { collection: 'Quest' });

mongoose.model('Quest', qstSchema);
