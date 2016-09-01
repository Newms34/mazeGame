var express = require('express');
var router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    async = require('async'),
    mongoose = require('mongoose'),
    session = require('client-sessions');
module.exports = router;
router.post('/reset', function(req, res, next) {
    var un = req.body.name,
        pwd = req.body.pass;
    mongoose.model('User').findOne({ 'name': un }, function(err, usr) {
        console.log('usr', usr)
        if (!usr) {
            console.log('no user!')
            res.send('no')
        } else {
            if (usr.correctPassword(pwd)) {
                var salt = mongoose.model('User').generateSalt();
                var resUsr = {
                    lvl: 1,
                    equip: {
                        head: [-1,-1,-1],
                        chest: [-1,-1,-1],
                        hands: [-1,-1,-1],
                        legs: [-1,-1,-1],
                        feet: [-1,-1,-1],
                        weap: [-1,-1,-1],
                        inv: []
                    },
                    salt: salt,
                    pass: mongoose.model('User').encryptPassword(pwd, salt),
                    questDone: [],
                    inProg: [],
                    maxHp: 50,
                    currHp: 50,
                    maxEn: 30,
                    currEn: 30,
                    isStunned: false
                }
                mongoose.model('User').update({ 'name': un }, resUsr, function(r) {
                    console.log('reset!')
                    res.send('yes')
                })
            } else {
                console.log('wrong pwd!')
                res.send('no')
            }
        }
    })
})
router.post('/save', function(req, res, next) {
    var newData = req.body,
        un= req.body.name;
    console.log('body', req.body, 'sesh', un)
    mongoose.model('User').update({ 'name': un }, newData, function(err, usr) {
        mongoose.model('User').findOne({ 'name': un }, function(err, usr) {
            console.log('tried to find user we just saved. Result is', usr, 'err is', err)
            req.session.user = usr;
            res.send(true);
        })
    })
})
router.get('/currUsrData', function(req, res, next) {
    //get current user data so we can update the front-end fields
    mongoose.model('User').findOne({ 'name': req.session.user.name }, function(err, usr) {
        res.send(usr);
    })
})
router.post('/new', function(req, res, next) {
    //record new user
    var un = req.body.user,
        pwd = req.body.password;
    mongoose.model('User').findOne({ 'name': un }, function(err, user) {
        if (!user) {
            //this user does not exist yet, so 
            //go ahead and record their un and pwd
            //then make a new user!
            var salt = mongoose.model('User').generateSalt();
            var newUser = {
                name: un,
                lvl: 1,
                equip: {
                    head: [-1,-1,-1],
                    chest: [-1,-1,-1],
                    hands: [-1,-1,-1],
                    legs: [-1,-1,-1],
                    feet: [-1,-1,-1],
                    weap: [-1,-1,-1],
                    inv: []
                },
                salt: salt,
                pass: mongoose.model('User').encryptPassword(pwd, salt),
                questDone: [],
                inProg: [],
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
    //notice how there are TWO routes that go to /login. This is OKAY, as long as they're different request types (the other one's GET, this is POST)
    mongoose.model('User').findOne({ 'name': req.body.name }, function(err, usr) {
        if (err || usr==null){
            //most likely, this user doesn't exist.
            res.send('no');
        }
        if (usr.correctPassword(req.body.pwd)) {
            //woohoo! correct user!
            //important note here: we must set all this session stuff, etc BEFORE
            //we send the response. As soon as we send the response, the server considers us "done"!
            req.session.user = usr;
            res.send('yes');
        } else {
            res.send('no');
        }
    })
});
router.get('/chkLog', function(req, res, next) {
    console.log('checking login', req.session)
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
    res.send('logged')
})

