var mongoose = require('mongoose');
var jnkSchema = new mongoose.Schema({
	lvl:Number,
    name:String,
    desc:String,
    cost:Number,
    num:Number
}, { collection: 'Junk' });
mongoose.model('Junk', jnkSchema);
