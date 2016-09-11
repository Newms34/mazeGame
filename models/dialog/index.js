//Note: This is ONLY for ambient dialog!
var mongoose = require('mongoose');
var talkSchema = new mongoose.Schema({
	questComp:Number, //certain dialog will require a quest to be completeted first
	text:String,
    num: Number
}, { collection: 'Dialog' });

mongoose.model('Dialog', talkSchema);
