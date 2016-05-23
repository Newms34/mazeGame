var express = require('express');
var router = express.Router();
var path = require('path');
var models = require('../models/');
var https = require('https');
var async = require('async');
var mongoose = require('mongoose');

router.get('/', function(req, res, next) {
	/*get the homepage (the game screen)
	Remember: the above args are:
	req: the request object (we don't use it here, but it COULD contain specific params passed into the route)
	res: the response object. We use this to actually send a response (res.send, res.sendFile, res.json, etc.)
	next: allows us to continue to the next router in line. Since each router on this page is a separate 'path', the next router in this case is the error handler.
	In other words, if all routes fail (if the server still can't figure out wtf you're sayin), send it all to the error handler!
	*/
    res.sendFile('index.html', { root: './views' })
});
router.get('/beastie/:id',function(req,res,next){
	//'params' below basically means 'anything in the url with a colon (:) before it'.
	var numberOfTheBeast = req.params.id;
	//in here we'll grab the beast by an id number. 
})
module.exports = router;
