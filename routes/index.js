var express = require('express');
var router = express.Router(),
    path = require('path'),
    models = require('../models/'),
    https = require('https'),
    async = require('async'),
    mongoose = require('mongoose'),
    session = require('client-sessions');

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
router.get('/user/:uiEl', function(req, res, next) {
    //not sure what this route was for?
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
module.exports = router;
