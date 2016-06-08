var mongoose = require('mongoose');
var npcSchema = new mongoose.Schema({
    name: String, //name of the npc. If not a quest-critical NPC, this may be auto-generated(?)
    important:Boolean,//is this npc quest-critical? Not sure what this will do currently. Make them a guaranteed spawn?
    isMerch:Boolean,//If this npc is a merchant, we can buy/sell from them. Note that for all intents and purposes, NPCs have infinite cash (because the 'sorry i can't buy your yak butter, i dont have enough money' from Skyrim is freakin annoying).
    inv:[{item:Number,num:Number}],//inventory of the NPC, along with which items they have. 
    lvl:Number, //not 100% sure about this one either. I'm thinking that this will be the dungeon 'level' on which the npc spawns. 
    num:Number
},{collection: 'Npc'});

mongoose.model('Npc', npcSchema);