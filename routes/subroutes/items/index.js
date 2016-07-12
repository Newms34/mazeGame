var express = require('express');
var router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    async = require('async'),
    mongoose = require('mongoose'),
    session = require('client-sessions');
module.exports = router;
router.get('/beastie/:id', function(req, res, next) {
    //'params' below basically means 'anything in the url with a colon (:) before it'.
    var numberOfTheBeast = req.params.id;
    //in here we'll grab the beast by an id number. 
})
router.get('/getRanMons/:cell', function(req, res, next) {
    console.log('someone wants a monster!')
    var cell = req.params.cell;
    mongoose.model('Mon').find({}, function(err, data) {
        var maxLvl = 10;
        //get max lvl of monster
        for (var i = 0; i < data.length; i++) {
            if (data[i].lvl > maxLvl) {
                maxLvl = data[i].lvl;
            }
        }
        maxLvl++; //so we dont get any monsters with a zero percent spawn chance
        var probArr = []; //this will be the probability array;
        for (var j = 0; j < data.length; j++) {
            for (k = 0; k < (maxLvl - data[j].lvl); k++) {
                probArr.push(j);
            }
        }
        var pickedMons = data[probArr[Math.floor(Math.random() * probArr.length)]];
        console.log('picked a', pickedMons)
        res.send({ mons: pickedMons, cell: cell })
    })
})
router.get('/Inventory', function(req, res, next) {
    //get all inv items
    mongoose.model('Armor').find({}, function(err, dataA) {
        mongoose.model('Weap').find({}, function(err, dataW) {
            res.send(dataA.concat(dataW));
        })
    })
});
router.get('/Quests', function(req, res, next) {
    //get all quests
    mongoose.model('Quest').find({}, function(err, data) {
        res.send(data);
    })
});
router.get('/Bestiary', function(req, res, next) {
    //get all monsters
    mongoose.model('Mon').find({}, function(err, dataA) {
        mongoose.model('Boss').find({}, function(err, dataW) {
            res.send(dataA.concat(dataW));
        })
    })
});
router.get('/Skills', function(req, res, next) {
    //get all skills
    mongoose.model('Skill').find({}, function(err, data) {
        res.send(data);
    })
});
// router.get('/user/:uiEl', function(req, res, next) {
//     //not sure what this route was for? Don't THINK we need it anymore!
//     mongoose.model('Skill').find({}, function(err, data) {
//         res.send(data);
//     })
// });
router.get('/getGiver/:npcNum', function(req, res, next) {
    mongoose.model('Npc').find({ num: req.params.npcNum }, function(err, data) {
        console.log('lookin for', req.params.npcNum, 'gives us', data)
        res.send(data);
    })
})
