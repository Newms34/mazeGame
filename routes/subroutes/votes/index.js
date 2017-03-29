var express = require('express');
var router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    async = require('async'),
    mongoose = require('mongoose'),
    session = require('client-sessions'),
    voteDur = 1000 * 60 * 60 * 24 * 7;
module.exports = router;
router.get('/testVote1324/:type', function(req, res, next) {
    //test route to insert a test vote.
    if (!req.params.type || req.params.type == 0) {
        //weap
        console.log('CREATING WEAPON')
        var minDmg = Math.floor(Math.random() * 5);
        var newWeap = {
            type: 0,
            vid: Math.floor(Math.random() * 99999).toString(32),
            votes: [3,
                4,
                2,
                5,
                2
            ],
            votesOpen: true,
            startTime: new Date().getTime(),
            weap: {
                name: 'Weap ' + Math.floor(Math.random() * 99999).toString(32),
                desc: 'A random weap!',
                min: minDmg,
                max: minDmg + Math.floor(Math.random() * 5),
                def: Math.floor(Math.random() * 5),
                itemLvl: 0,
                cost: Math.floor(Math.random() * 15),
                imgUrl: '',
                num: -1
            }
        };
        mongoose.model('Vote').create(newWeap, function() {
            res.send('Weap should be done.')
        })
    } else if (req.params.type == 1) {
        //armor
        console.log('CREATING ARMOR')
        mongoose.model('Vote').create({
            type: 1,
            vid: Math.floor(Math.random() * 99999).toString(32),
            votes: [3,
                4,
                2,
                5,
                2
            ],
            votesOpen: true,
            startTime: new Date().getTime(),
            armor: {
                name: 'Armor' + Math.floor(Math.random() * 99999).toString(32),
                def: Math.floor(Math.random() * 15),
                desc: 'A random armor!',
                res: [1, 2, 3],
                cost: Math.floor(Math.random() * 5),
                itemLvl: Math.floor(Math.random() * 5),
                slot: Math.floor(Math.random() * 5),
                num: -1,
                heavy: Math.random() > .5
            }
        }, function() {
            res.send('Armor should be done.')
        })
    } else {
        //skill
        console.log('CREATING SKILL')
        mongoose.model('Vote').create({
            type: 2,
            vid: Math.floor(Math.random() * 99999).toString(32),
            votes: [3,
                4,
                2,
                5,
                2
            ],
            votesOpen: true,
            startTime: new Date().getTime(),
            skill: {
                name: 'Skill ' + Math.floor(Math.random() * 99999).toString(32),
                id: 31,
                desc: 'A test skill! Delete me!',
                energy: 100,
                heal: 50,
                regen: 5,
                burst: 100,
                degen: 5,
                type: 1,
                stuns: true,
                imgUrl: '',
                prevSkill: 30,
                nextSkills: [],
                skillPts: 8,
                extraFx: {
                    dmgVsStun: Math.random() > .5,
                    protection: Math.random() > .5,
                    dmgVsDegen: Math.random() > .5,
                    critChance: Math.random() > .5
                }
            }
        }, function() {
            res.send('Skill should be done.')
        })
    }
})
router.post('/subVote', function(req, res, next) {
    //submit a vote item for voting!
    var voteInf = req.body
    console.log('checking login', req.session)
    if (!req.session || !req.session.user || req.body.user !== req.session.user.name) {
        res.send('auth error in vote!'); //user trying to 'spoof' a request
    } else {
        var voteMode = 'Weap'
        if (voteInf.type == 1) {
            voteMode = 'Armor';
        } else if (voteInf.type == 2) {
            voteMode == 'Skill';
        }
        mongoose.model('Vote').find({}, function(errv, vs) {
            mongoose.model(voteMode).find({}, function(err, voteItems) {
                //this should NOT find anything.
                if (errv) {
                    res.send(err);
                    return;
                } else {
                    //now the fun part: parsing all the data as appropriate;
                    var voteObj = {
                        type: voteInf.type || 0,
                        vid: Math.floor(Math.random() * 99999999).toString(32),
                        votesOpen: true,
                        startTime: new Date().getTime()
                    };
                    if (voteMode == 'Weap') {
                        voteObj.weap = req.body.weap;
                        voteObj.weap.num = voteItems.length;
                    } else if (voteMode == 'Armor') {
                        voteObj.armor = req.body.armor;
                        voteObj.armor.num = voteItems.length;
                    } else if (voteMode == 'Skill') {
                        voteObj.skill = req.body.skill;
                        voteObj.skill.id = voteItems.length;
                    }
                    console.log('FINAL OBJ', voteObj)
                        //done!
                    mongoose.model('Vote').create(voteObj);
                    res.send('done!');
                }
            });
        });
    }
});
router.get('/voteList', function(req, res, next) {
    mongoose.model('Vote').find({}, function(errv, votes) {
        mongoose.model('Armor').find({}, function(erra, armor) {
            mongoose.model('Skill').find({}, function(errs, skills) {
                mongoose.model('Weap').find({}, function(errw, weaps) {
                    console.log('VOTES TO FRONT END', votes)
                    if (errv || errs || erra || errw || !votes.length) {
                        res.send({
                            skills: skills,
                            votes: [],
                            armor: armor,
                            weaps: weaps
                        });
                    } else {
                        res.send({
                            skills: skills,
                            votes: votes,
                            armor: armor,
                            weaps: weaps
                        });
                    }
                });
            });
        });
    });
})
var voteTimer = setInterval(function() {
    //run every 30 seconds to check 'expired' votes.
    mongoose.model('Vote').find({}, function(err, votes) {
        if (err) {
            //can we have some sort of err checking here?
            return false;
        } else if (!votes.length) {
            return false;
        } else {
            var now = new Date().getTime();
            console.log('Checking votes at ',now)
            votes.forEach(function(v) {
                if ((now - v.startTime) > voteDur) {
                    //vote expired!
                    //now we 'decide' if the vote passed. That is,
                    //1) Are there 2 or more votes? This is done so that a single user cannot vote in an item by themselves that they created
                    //2) Is the average score of the votes greater than 3.5 (70%)?
                    var voteAvg = v.votes.reduce(function(a, b) {
                        return a + b;
                    }) / v.votes.length;
                    if (voteAvg > 3.5 && v.votes.length > 2) {
                        var itemType = v.type == 0 ? 'Weap' : v.type == 1 ? 'Armor' : 'Skill';
                        mongoose.model(itemType).find({}, function(err, items) {
                            var numItems = items.length;
                            if (v.type == 2) {
                                //skill
                                v.skill.id = numItems;
                                mongoose.model(itemType).update({ id: v.skill.prevSkill }, { $push: { nextSkills: numItems } }, function(err, psk) {
                                    mongoose.model(itemType).create(v.skill);
                                })
                            } else if (v.type && v.type != 0) {
                                //armor
                                v.armor.num = numItems;
                                mongoose.model(itemType).create(v.armor, function(err, resp) {
                                    mongoose.model('Vote').findOne({ id: v.vid }).remove();
                                })
                            } else {
                                //weap
                                v.weap.num = numItems;
                                mongoose.model(itemType).create(v.weap, function(err, resp) {
                                    mongoose.model('Vote').findOne({ id: v.vid }).remove();
                                })
                            }
                        })
                    } else {
                        //item was not voted in. simply remove.
                        mongoose.model('Vote').find({ id: v.vid }).remove();
                    }
                }
            })
        }
    })
}, 30000);
router.post('/doVote', function(req, res, next) {
    console.log('vote data', req.body)
    mongoose.model('Vote').findOne({ vid: req.body.id }, function(err, v) {
        v.votes.push(req.body.val);
        if (!v.votedUsrs) {
            v.votedUsrs = [];
        }
        console.log('USER TRYING TO VOTE', req.session.user, req.body.usr)
        if (!req.session.user || req.session.user.name != req.body.usr || v.votedUsrs.indexOf(req.body.usr) > -1) {
            //user attempted to fake vote
            //Either by being not logged in, being the wrong user, or having already voted
            res.send('voteFraud');
        } else {
            v.votedUsrs.push(req.body.usr);
            v.save(function() {
                res.send('done');
            });
        }
    })
})
