var express = require('express');
var router = express.Router(),
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    mongoose = require('mongoose');
module.exports = router;

//any routes that don't explicitly fit into either items or users!
router.get('/news', function(req, res, next) {
    fs.readFile('news.txt', 'utf-8', function(err, data) {
        console.log(err, data)
        if (err) {
            res.send('Couldn\'t get news!');
        } else {
            res.send(data);
        }
    })
})
router.get('/oneNpc/:i', function(req, res, next) {
    mongoose.model('Npc').find({}, function(err, data) {
        res.send({ i: req.params.i, data: data[Math.floor(Math.random() * data.length)] });
    })
})
router.get('/mus/:m', function(req, res, next) {
    res.set({'Content-Type': 'audio/mpeg'});
    fs.readdir('./public/music/' + req.params.m, function(err, musFiles) {
        var randFile = musFiles[Math.floor(Math.random() * musFiles.length)];
        console.log(randFile)
        var readStream = fs.createReadStream('./public/music/' + req.params.m + '/' + randFile);
        readStream.pipe(res);
    })
})
