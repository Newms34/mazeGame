var mongoose = require('mongoose');
/*I'm really not sure about the format for quests yet. So this all is probly gonna change pretty Jurassically.
So far, each quest has all of the normal attributes (name, id, desc, lvl). It also has a giver, which corresponds to to the NPC that gives it.  It also has a 'steps' array, where each step has a txt description, a step number, and either a monster goal or an item goal. Can we do NPC goals too? for example, "talk to Bob to complete this quest!"
*/
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
