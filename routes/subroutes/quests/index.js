var express = require('express');
var router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    async = require('async'),
    mongoose = require('mongoose'),
    session = require('client-sessions');
module.exports = router;

router.post('/lvlQuest', function(req, res, next) {
    //this route gets specific quests at each level. These quests are guaranteed, and trigger upon reaching their specified level. So, for example, a particular boss might spawn only on level 5. 
    console.log('checking login', req.session)
    if (!req.session || !req.session.user || req.body.user !== req.session.user.name) {
        res.send('auth error in lvlQuest'); //user trying to 'spoof' a request
    } else {
        mongoose.model('Quest').findOne({ "lvl": req.body.lvl, "lvlQuest": true }, function(err, qs) {
            mongoose.model('User').findOne({ "name": req.body.user }, function(err, u) {
                //note that unlike randQuest, there can only be one lvlQuest per level. these are usually main boss fights.
                var questAct = false;
                u.inProg.forEach((questCand) => {
                    questAct = qs.id == questCand.id;
                })
                if (u.questDone.indexOf(qs.id) > -1 || questAct) {
                    res.send('no new quests!')
                } else {
                    res.send(qs);
                }
            });
        });
    }
});
router.get("/randQuest/:lvl", function(req, res, next) {
    //get a random level-appropriate quest. Note that the level may be anywhere from 1 level below to 3 levels above the current pLvl.
    console.log('checking login', req.session)
    if (!req.session || !req.session.user || req.body.user !== req.session.user.name) {
        res.send('auth error in randQuest'); //user trying to 'spoof' a request
    } else {
        mongoose.model('Quest').find({ "lvl": { $gt: parseInt(req.body.lvl) - 1, $lt: parseInt(req.body.lvl) + 3 } }, function(err, qs) {
            mongoose.model('User').findOne({ "name": req.body.user }, function(err, u) {
                //now, pick a random quest from available quests.
                var questFin = true,
                    pickedQuest = null,
                    attemptsLeft = 100;
                while (questFin && qs.length) {
                    pickedQuest = qs[Math.floor(Math.random() * qs.length)];
                    questFin = u.questDone.indexOf(pickedQuest.id) > -1;
                    if (!questFin) {
                        //quest does not appear to be done. Check if it's already in progress.
                        u.inProg.forEach((questCand) => {
                            questFin = pickedQuest.id == questCand.id;
                        })
                    }
                    if (questFin && --attemptsLeft) {
                        //too many attempts used, so likely no (more) quests @ this lvl.
                        questFin = false;
                        pickedQuest = null;
                    }
                };
                if (pickedQuest) {
                    res.send(false)
                } else {
                    //should now have a quest! first, let's record that in the user model.
                    u.inProg.push[{ id: pickedQuest.id, status: 0 }];
                    u.save();
                }
            });
        });
    }
});
router.get('/npcQ/:x/:y/:l/:n', function(req, res, next) {
    if (!req.session || !req.session.user || req.params.n !== req.session.user.name) {
        res.send('auth error in npcQ');
    } else {
        // { $gte: parseInt(req.params.l), $lt: parseInt(req.params.l) + 6 }
        mongoose.model('Quest').find({ 'lvl': { "$gte": parseInt(req.params.l), "$lt": parseInt(req.params.l) + 4 } }, function(err, qs) {
            console.log('quest results from level', req.params.l, ' to '+(parseInt(req.params.l)+4)+' are', err, qs)
            if (!qs || !qs.length) {
                res.send(false)
                return;
            }
            mongoose.model('User').findOne({ "name": req.params.n }, function(err, u) {
                //now, pick a random quest from available quests.
                var questFin = true,
                    pickedQuest = null,
                    attemptsLeft = 100;
                while (questFin) {
                    pickedQuest = qs[Math.floor(Math.random() * qs.length)];
                    questFin = u.questDone.indexOf(pickedQuest.id) > -1;
                    if (!questFin) {
                        //quest does not appear to be done. Check if it's already in progress.
                        u.inProg.forEach((questCand) => {
                            questFin = pickedQuest.id == questCand.id;
                        })
                    }
                    if (questFin && --attemptsLeft) {
                        //too many attempts used, so likely no (more) quests @ this lvl.
                        questFin = false;
                        pickedQuest = null;
                    }
                };
                console.log('Final picked quest',pickedQuest)
                if (!pickedQuest) {
                    res.send(false)
                } else {
                    //should now have a quest! first, let's record that in the user model.
                    res.send({
                        q: pickedQuest,
                        id: req.params.x + '-' + req.params.y
                    });
                }
            });
        });
    }
})
