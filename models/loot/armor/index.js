var mongoose = require('mongoose');
var armorSchema = new mongoose.Schema({
    name: String, //name of the armor piece
    def: Number,
    desc: String,
    res: [Number],//armor resistances (if any!)
    cost:Number,
    itemLvl:Number,
    slot:Number,
    imgUrl:String,
    num:Number,
    heavy:{type: boolean, default:false}//this indicates the armor weight. If the item has a weight of FALSE, the armor is LIGHT armor (necro and sorc). Otherwise, the armor is HEAVY (paly and war)
},{collection: 'Armor'});
/*slot describes where the item goes:
0:head,
1:chest,
2:legs,
3:hands,
4:feet
5:ring
*/
mongoose.model('Armor', armorSchema);