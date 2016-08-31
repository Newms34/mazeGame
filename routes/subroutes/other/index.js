var express = require('express');
var router = express.Router(),
    path = require('path'),
    async = require('async'),
    fs = require('fs');
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