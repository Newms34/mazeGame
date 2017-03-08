var express = require('express');
var router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    async = require('async'),
    mongoose = require('mongoose'),
    startStats = require('./startStats.js'),
    session = require('client-sessions');
module.exports = router;
router.post('/reset', function(req, res, next) {
    var un = req.body.name,
        pwd = req.body.pass,
        prof = parseInt(req.body.prof) || 1;
    mongoose.model('User').findOne({ 'name': un }, function(err, usr) {
        console.log('usr', usr);
        if (!usr) {
            console.log('no user!');
            res.send('no');
        } else {
            if (usr.correctPassword(pwd)) {
                var usrSkills = startStats.getSkills(prof);
                var salt = mongoose.model('User').generateSalt();
                var resUsr = {
                    lvl: 1,
                    playerLvl: 1,
                    prof: prof,
                    equip: {
                        gold: 100,
                        head: [-1, -1, -1],
                        chest: [-1, -1, -1],
                        hands: [-1, -1, -1],
                        legs: [-1, -1, -1],
                        feet: [-1, -1, -1],
                        weap: [3, 0, 8],
                        inv: []
                    },
                    salt: salt,
                    pass: mongoose.model('User').encryptPassword(pwd, salt),
                    questDone: [],
                    inProg: [],
                    currentLevel: {
                        loc: null,
                        data: [],
                        names: []
                    },
                    skills: usrSkills,
                    maxHp: 50,
                    currHp: 50,
                    maxEn: 30,
                    currEn: 30,
                    isStunned: false
                }
                mongoose.model('User').update({ 'name': un }, resUsr, function(r) {
                    console.log('reset!');
                    res.send('yes');
                })
            } else {
                console.log('wrong pwd!');
                res.send('no');
            }
        }
    });
});
router.post('/save', function(req, res, next) {
    var newData = req.body,
        un = req.body.name;
    console.log('body', req.body, 'sesh', un);
    console.log('inventory:', JSON.stringify(req.body.equip));
    mongoose.model('User').update({ 'name': un }, newData, function(err, usr) {
        mongoose.model('User').findOne({ 'name': un }, function(err, usr) {
            console.log('tried to find user we just saved. Result is', usr, 'err is', err);
            // console.log('current cell of user:',usr.currentLevel.loc)
            req.session.user = usr;
            res.send(true);
        });
    });
});
router.get('/currUsrData', function(req, res, next) {
    //get current user data so we can update the front-end fields
    console.log(req.session.user);
    mongoose.model('User').findOne({ 'name': req.session.user.name }, function(err, usr) {
        res.send(usr);
    });
});
router.post('/new', function(req, res, next) {
    //record new user
    console.log('NEW USER DATA-----:', req.body)
    var un = req.body.user,
        pwd = req.body.password,
        prof = parseInt(req.body.prof) || 1;
    mongoose.model('User').findOne({ 'name': un }, function(err, user) {
        if (!user) {
            //this user does not exist yet, so 
            //go ahead and record their un and pwd
            //then make a new user!
            var usrSkills = startStats.getSkills(prof);
            var salt = mongoose.model('User').generateSalt();
            var newUser = {
                name: un,
                lvl: 1,
                playerLvl: 1,
                prof: prof,
                equip: {
                    gold: 100,
                    head: [-1, -1, -1],
                    chest: [-1, -1, -1],
                    hands: [-1, -1, -1],
                    legs: [-1, -1, -1],
                    feet: [-1, -1, -1],
                    weap: [3, 0, 8],
                    inv: []
                },
                salt: salt,
                pass: mongoose.model('User').encryptPassword(pwd, salt),
                questDone: [],
                inProg: [],
                currentLevel: {
                    loc: null,
                    data: [],
                    names: []
                },
                skills: usrSkills,
                maxHp: 50,
                currHp: 50,
                maxEn: 30,
                currEn: 30,
                isStunned: false
            }
            console.log(newUser);
            mongoose.model('User').create(newUser);
            res.send('saved!')
        } else {
            res.send('DUPLICATE');
        }
    });
});
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
    //notice how there are TWO routes that go to /login. This is OKAY, as long as they're different request types (the other one's GET, this is POST)
    mongoose.model('User').findOne({ 'name': req.body.name }, function(err, usr) {
        console.log('USER FROM LOGIN:', usr);
        if (err || !usr || usr === null) {
            //most likely, this user doesn't exist.
            res.send('no');
        } else if (usr.correctPassword(req.body.pwd)) {
            //woohoo! correct user!
            //important note here: we must set all this session stuff, etc BEFORE
            //we send the response. As soon as we send the response, the server considers us "done"!
            req.session.user = usr;
            res.send('yes');
        } else {
            res.send('no');
        }
    });
});
router.get('/chkLog', function(req, res, next) {
    console.log('checking login', req.session);
    if (req.session.user) {
        res.send(true);
    } else {
        res.send(false);
    }
});
router.get('/logout', function(req, res, next) {
    /*this function logs out the user. It has no confirmation stuff because
    1) this is on the backend
    2) this assumes the user has ALREADY said "yes", and
    3) logging out doesn't actually really require any credentials (it's logging IN that needs em!)
    */
    console.log('usr sez bai');
    req.session.reset();
    res.send('logged');
});
router.post('/addXp', function(req, res, next) {
    if (!req.body.xp || req.body.xp === 0) {
        res.send('err');
    } else {
        mongoose.model('User').findOne({ 'name': req.body.user }, function(err, usr) {
            if (err || !usr) {
                res.send('err');
            } else {
                usr.currLvlXp += req.body.xp;
                var didLevel = false;
                if (usr.currLvlXp > 500) {
                    usr.currLvlXp = 0;
                    usr.playerLvl++;
                    usr.skillPts++;
                    didLevel = true;
                }
                usr.save(function(r) {
                    res.send({
                        lvl: usr.playerLvl,
                        xpTill: usr.currLvlXp,
                        leveled: didLevel,
                        skillPts: usr.skillPts
                    });
                });
            }

        });
    }
});
router.post('/buySkill', function(req, res, next) {
    //note that we simply send a 'status': if the user successfully bought the skill, true; otherwise false.
    mongoose.model('Skill').find({}, function(skErr, skLst) {
        if (!req.body.usr || !req.session || req.session.user.name != req.body.usr || !req.body.skill) {
            //something's missing/incorrect!
            res.send(false);
        } else {
            mongoose.model('User').findOne({ 'name': req.body.usr }, function(uErr, user) {
                var desiredSkill = null;
                for (var i = 0; i < skLst.length; i++) {
                    if (skLst[i].num == req.body.skill) {
                        desiredSkill = skLst[i];
                    }
                }
                if (user.skills.indexOf(req.body.skill) != -1 || user.skills.indexOf(desiredSkill.prevSkill) == -1 || user.skillPts < desiredSkill.skillPts) {
                    /*EITHER:
                    skill already owned,
                    previous skill not bought
                    or not enough points
                    */
                    res.send(false);
                } else {
                    user.skills.push(desiredSkill.num);
                    user.save(function() {
                        res.send(true);
                    });
                }
            });
        }
    });
});