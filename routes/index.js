var express = require('express');
var router = express.Router();
var path = require('path');
var models = require('../models/');
var https = require('https');
var async = require('async');
var mongoose = require('mongoose');

router.get('/', function(req, res, next) {
    res.sendFile('index.html', { root: './views' })
});

module.exports = router;
