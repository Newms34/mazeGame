var mongoose = require('mongoose');
var usrSchema = new mongoose.Schema({
    attempts:Number,
    reg_codes:[String],
    dereg_code:String,
    email: String,
    name: String,
    isReg:Boolean
},{collection: 'Usr'});
//name and email are self-explanatory. Attempts is 1-4: after 4 attempts, that email is prevented from regging (due to spam). reg codes is an array with 0-4 items (the possible registration codes). dereg code is 'reset' each time user attempts to register this email (assuming it has not already been reg'd!), and allows user to remove themselves.

mongoose.model('Usr', usrSchema);