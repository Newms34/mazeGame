var express = require('express');
var router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    async = require('async'),
    mongoose = require('mongoose'),
    session = require('client-sessions'),
    gauss = require('gaussian'),
    q = require('q');
mongoose.Promise = require('q').Promise;
module.exports = router;
var findItemAtLvl = function(l, a) {
    var retArr = [];
    for (var i = 0; i < a.length; i++) {
        if ((a[i].lvl && a[i].lvl == l) || (a[i].itemLvl && a[i].itemLvl == l)) {
            retArr.push(a[i]);
        }
    }
    return retArr;
}

//note that for the monster-getters, they ONLY select from normal monsters. Boss monsters are kept in a separate collection.
router.get('/beastie/:lvl/:cell', function(req, res, next) {
    mongoose.model('Mon').find({}, function(err, data) {
        var monDist = gauss(parseInt(req.params.lvl) - 1, 4);
        //get a gaussian distribution of monster levels
        var theMons = Math.floor(monDist.ppf(Math.random()));
        while (!findItemAtLvl(theMons, data).length) {
            //no monster @ this lvl!
            console.log(findItemAtLvl(theMons, data))
            theMons = Math.floor(monDist.ppf(Math.random()));
            console.log('trying lvl', theMons)
        }
        var possMons = findItemAtLvl(theMons, data);
        var mons = possMons[Math.floor(Math.random() * possMons.length)];
        console.log('picked a', mons)
        res.send({ mons: mons, cell: req.params.cell })
    })
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
        while (mons.isBoss) {
            //cannot select boss (quest-specific) monsters
            mons = possMons[Math.floor(Math.random() * possMons.length)];
        }
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
router.get('/allUI', function(req, res, next) {
    var promArr = [];
    promArr.push(mongoose.model('Armor').find({}).exec())
    promArr.push(mongoose.model('Weap').find({}).exec())
    promArr.push(mongoose.model('Affix').find({}).exec())
    promArr.push(mongoose.model('Junk').find({}).exec())
    promArr.push(mongoose.model('Quest').find({}).exec())
    promArr.push(mongoose.model('Skill').find({}).exec())
    promArr.push(mongoose.model('Mon').find({}).exec())
    q.all(promArr).then(function(r) {
        console.log('updating UI with elements')
        res.send(r)
    })
})
router.get('/allItems/', function(req, res, next) {
    //get all inv items (weapons, armor, affixes, AND junk)
    mongoose.model('Armor').find({}, function(err, dataA) {
        mongoose.model('Weap').find({}, function(err, dataW) {
            mongoose.model('Affix').find({}, function(err, dataP) {
                mongoose.model('Junk').find({}, function(err, dataJ) {
                    res.send([dataA, dataW, dataP, dataJ]);
                })
            })
        })
    })
});
router.get('/byLvl/:lvl', function(req, res, next) {
    //get all inv items, then pick either loot or junk by lvl
    //basically, we get all items up to 4 levels above (and below!) current level
    //we then use a gaussian distribution curve to pick one item

    var dist = gauss(parseInt(req.params.lvl) + 1, 4);
    mongoose.model('Armor').find({ "itemLvl": { $lt: parseInt(req.params.lvl) + 4 } }, function(err, dataA) {
        mongoose.model('Weap').find({ "itemLvl": { $lt: parseInt(req.params.lvl) + 4 } }, function(err, dataW) {
            mongoose.model('Affix').find({}, function(err, dataP) {
                mongoose.model('Junk').find({ "lvl": { $lt: parseInt(req.params.lvl) + 4 } }, function(err, dataJ) {
                    var lootz = { num: parseInt(req.params.lvl) };
                    console.log('to start, lootz is', lootz)
                    if (Math.random() > 0.5) {
                        //half the time, user gets loot
                        lootz.loot = {};
                        //60% of the time, loot is armor. Otherwise, loot is weapon.
                        //I may adjust these nums later, but for now, the slightly higher percentage of armor to weapons is generally because you need more armor than you do weapons.
                        var itemArrNum = Math.random() > 0.4 ? 0 : 1;
                        var itemArr = itemArrNum && itemArrNum > 0 ? dataW : dataA;
                        var actualLvl = Math.floor(dist.ppf(Math.random()));
                        lootz.type = itemArrNum;
                        //now continue redoing this until we actually get a list of items;
                        while (!findItemAtLvl(actualLvl, itemArr).length) {
                            actualLvl = Math.floor(dist.ppf(Math.random()));
                        }
                        console.log('lvl of item', actualLvl)
                        var lItems = findItemAtLvl(actualLvl, itemArr);
                        console.log('list of items at level', lItems);
                        //so we should now have an array of item(s) of a normal-distributed random number. Pick one:
                        lootz.loot.base = lItems[Math.floor(Math.random() * lItems.length)];
                        console.log('chosen base', lootz.loot.base);
                        //pick a random prefix and suffix
                        lootz.loot.pre = dataP[Math.floor(Math.random() * dataP.length)];
                        lootz.loot.post = dataP[Math.floor(Math.random() * dataP.length)];

                    } else {
                        //otherwise, the user gets junk (which is still valuable, but basically merch fodder)
                        lootz.type = 'junk';
                        var actualLvl = Math.floor(dist.ppf(Math.random()));
                        //now continue redoing this until we actually get a list of items;
                        while (!findItemAtLvl(actualLvl, dataJ).length) {
                            actualLvl = Math.floor(dist.ppf(Math.random()));
                        }
                        var jItems = findItemAtLvl(actualLvl, dataJ);
                        //so we should now have an array of item(s) of a normal-distributed random number. Pick one:
                        lootz.loot = jItems[Math.floor(Math.random() * jItems.length)];
                    }
                    res.send(lootz);
                })
            })
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
