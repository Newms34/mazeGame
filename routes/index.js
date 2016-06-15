var express = require('express');
var router = express.Router();
var path = require('path');
var models = require('../models/');
var https = require('https');
var async = require('async');
var mongoose = require('mongoose');
var session = require('client-sessions');

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
    //get all inv items
    mongoose.model('Quest').find({}, function(err, data) {
        res.send(data);
    })
});
router.get('/Bestiary', function(req, res, next) {
    //get all inv items
    mongoose.model('Mon').find({}, function(err, dataA) {
        mongoose.model('Boss').find({}, function(err, dataW) {
            res.send(dataA.concat(dataW));
        })
    })
});
router.get('/Skills', function(req, res, next) {
    //get all inv items
    mongoose.model('Skill').find({}, function(err, data) {
        res.send(data);
    })
});
router.get('/user/:uiEl', function(req, res, next) {
    //get all inv items
    mongoose.model('Skill').find({}, function(err, data) {
        res.send(data);
    })
});
router.get('/getGiver/:npcNum', function(req, res, next) {
    mongoose.model('Npc').find({ num: req.params.npcNum }, function(err, data) {
        console.log('lookin for', req.params.npcNum, 'gives us', data)
        res.send(data);
    })
})
router.get('/login', function(req, res, next) {
    //send user to login page. This also gets called below if the user fails @ login.
    //This page will include BOTH a login AND signup option!
    res.sendFile('login.html', { root: './views' })
})
router.post('/auth', function(req, res, next) {
    var un = req.body.user,
        pwd = req.body.password;
    mongoose.model('User').findOne({ name: un }, function(err, user) {
        if (!user) {
            res.redirect('/login');
        } else {
            if (user.correctPwd(pwd)) {
                // sets a cookie with the user's info
                req.session.user = user;
                res.redirect('/dashboard');
            } else {
                res.redirect('/login');
            }
        }
    })
})
router.post('/new', function(req, res, next) {
    //record new user
    var un = req.body.user,
        pwd = req.body.password;
    mongoose.model('User').findOne({ name: un }, function(err, user) {
        if (!user) {
            //this user does not exist yet, so 
            //go ahead and record their un and pwd
            var salt = mongoose.model('User').generateSalt();
            var newUser = {
                name: un,
                lvl: 1,
                equip: {
                    head: 0,
                    chest: 0,
                    hands: 0,
                    legs: 0,
                    feet: 0,
                    lHand: 0,
                    rHand: 0,
                    inv: []
                },
                salt: salt,
                pass: mongoose.model('User').encryptPassword(pwd, salt),
                questDone: [],
                inProf: [],
                maxHp: 50,
                currHp: 50,
                maxEn: 30,
                currEn: 30,
                isStunned: false
            }
            console.log(newUser);
            mongoose.model('User').create(newUser);
            res.send('saved! sorta...')
        } else {
            res.send('DUPLICATE')
        }
    })
})
router.get('/nameOkay/:name', function(req, res, next) {
    mongoose.model('User').find({ 'name': req.params.name }, function(err, user) {
        if (!user.length) {
            //this user does not exist yet, so 
            //go ahead and record their un and pwd
            res.send('okay');
        } else {
            res.send('bad');
        }
    });
});
router.post('/login', function(req, res, next) {
    mongoose.model('User').findOne({ 'name': req.body.name }, function(err, usr) {
        if (usr.correctPassword(req.body.pwd)) {
            res.send('yes');
            //woohoo! correct user!
            console.log(req.mazeSesh);
            req.mazeSesh.user = usr;
        } else {
            res.send('no');
        }
    })
});
router.get('/chkLog', function(req, res, next) {
    console.log(req.mazeSesh);
    if (req.mazeSesh){
        res.send(true);
    }else{
        res.send(false);
    }
});
module.exports = router;
