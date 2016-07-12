var express = require('express');
var router = express.Router(),
    path = require('path'),
    models = require('../models/'),
    https = require('https'),
    async = require('async'),
    mongoose = require('mongoose'),
    session = require('client-sessions');

//instead of putting all our routes in one folder, we can use node's 'modules' to split up
//our stuff. Modularization!
router.use('/item', require('./subroutes/items'));
router.use('/user', require('./subroutes/users'));
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

router.get('/mobile', function(req, res, next) {
    /*get mobile!*/
    res.sendFile('mobile.html', { root: './views' })
});

router.get('/login', function(req, res, next) {
    //send user to login page. This also gets called below if the user fails @ login.
    //This page will include BOTH a login AND signup option!
    res.sendFile('login.html', { root: './views' })
})
router.use(function(req, res) {
    res.status(404).end();
});
module.exports = router;
