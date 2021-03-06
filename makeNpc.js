//script to generate a random NPC
//run 'node makeNpc.js' to generate and save a random NPC.
//add '-m' flag to designate Npc as merchant
var mongoose = require('mongoose'),
    models = require('./models'),
    npcList = [],
    https = require('https'),
    kid = require('child_process'),
    prompt = require('prompt'),
    fs = require('fs');
console.log(process.argv)
mongoose.model('Npc').find({}, function(err, npcs) {
    npcList = npcs;
    var makeMerch = false,
        live = false,
        randName = 'John Smith';//default name to john smith.
    for (var i = 0; i < process.argv.length; i++) {
        if (process.argv[i] == '-m' || process.argv[i] == '-merch' || process.argv[i] == '-merc') {
            makeMerch = true;
        } else if (process.argv[i] == '-exp' || process.argv[i] == '-e' || process.argv[i] == '-live') {
            live = true;
        }
    }
    https.get({
        host: 'en.wiktionary.org',
        path: '/w/api.php?action=query&list=categorymembers&cmlimit=500&cmtype=page&format=json&cmtitle=Category:English_male_given_names'
    }, function(fres) {
        // Continuously update stream with data
        var fbody = '';
        fres.on('data', function(d) {
            fbody += d;
        });
        fres.on('end', function() {
            // Data reception is done, do whatever with it!
            var fNameList = [];
            JSON.parse(fbody).query.categorymembers.forEach(function(el) {
                fNameList.push(el.title);

            });
            randName = fNameList[Math.floor(Math.random() * fNameList.length)] + ' ';
            //and now the lastname (starting at a random letter)
            var path = '/w/api.php?action=query&list=categorymembers&cmlimit=500&cmsort=sortkey&cmstartsortkeyprefix=' + String.fromCharCode(65 + Math.floor(Math.random() * 26)).toLowerCase() + '&cmnamespace=0&format=json&cmtitle=Category:English_surnames';
            https.get({
                host: 'en.wiktionary.org',
                path: path
            }, function(lres) {
                var lastNamesBody = '';
                lres.on('data', function(ld) {
                    lastNamesBody += ld;
                });
                lres.on('end', function() {
                    var lNameList = [];
                    JSON.parse(lastNamesBody).query.categorymembers.forEach(function(el) {
                        lNameList.push(el.title);
                    });
                    randName += lNameList[Math.floor(Math.random() * lNameList.length)];
                    console.log(randName);
                    //note that merchants do not sell junk.
                    //they (should) buy it tho!
                    mongoose.model('Armor').find({}, function(err, dataA) {
                        mongoose.model('Weap').find({}, function(err, dataW) {
                            mongoose.model('Affix').find({}, function(err, dataP) {
                                mongoose.model('Dialog').find({}, function(err, dataD) {
                                    var lvl = Math.floor(Math.random() * 5),
                                        numItems = Math.ceil(Math.random() * 30),
                                        numDiag = Math.ceil(Math.random() * 10),
                                        mNpc = mongoose.model('Npc')();
                                    mNpc.important = false;//since these npcs are randomly generated, and thus not part of a quest, they are not important.
                                    mNpc.lvl = lvl;
                                    mNpc.gossip = [];
                                    mNpc.inv = [];
                                    mNpc.num = npcs.length;
                                    mNpc.isMerch = makeMerch;
                                    mNpc.name = randName;
                                    for (var t = 0; t < numItems; t++) {
                                        if (Math.random() > .5) {
                                            //weap
                                            mNpc.inv.push({
                                                lootType: 1,
                                                num: Math.ceil(Math.random() * 5),
                                                item: [Math.floor(Math.random() * dataP.length), Math.floor(Math.random() * dataW.length), Math.floor(Math.random() * dataP.length)]
                                            })
                                        } else {
                                            //armor
                                            mNpc.inv.push({
                                                lootType: 0,
                                                num: Math.ceil(Math.random() * 5),
                                                item: [Math.floor(Math.random() * dataP.length), Math.floor(Math.random() * dataA.length), Math.floor(Math.random() * dataP.length)]
                                            })
                                        }
                                    }
                                    for (var q = 0; q < numDiag; q++) {
                                        mNpc.gossip.push(dataD[Math.floor(Math.random() * dataD.length)].text)
                                    }
                                    console.log('Your NPC:', mNpc)
                                    mNpc.inv.forEach(function(e) { console.log('ITEMS:', e.item) })
                                        // mongoose.model('Npc').create(theNpc);
                                    if (!live) {
                                        //saving to local db, not heroku
                                        mNpc.save();
                                    } else {
                                        prompt.start();
                                        var promSchema = {
                                            properties: {
                                                password: {
                                                    hidden: true
                                                }
                                            }
                                        }
                                        prompt.get(promSchema, function(err, resp) {
                                            fs.writeFile('D:\\Data\\Projects\\maze\\seeds\\tempNpc.json', '[' + JSON.stringify(mNpc).replace(/"_id":"\w+",/g, '') + ']', { flags: 'w' }, function(err, res) {
                                                if (err) console.log('Uh oh! trouble writing to file!');
                                                kid.exec('c: && cd c:\\mongodb\\bin && mongoimport -h ds011913.mlab.com:11913 -d heroku_701xzs88 -c Npc -u newms -p ' + resp.password + ' --jsonArray --file D:\\Data\\Projects\\maze\\seeds\\tempNpc.json', function(err, stdout, stderr) {
                                                    if (err) {
                                                        console.log('Uh oh! An error of "', err, '" prevented us from uploading this merch!');
                                                    }else{
                                                        console.log('Successfully uploaded NPC',mNpc.name)
                                                    }
                                                    process.exit(0)
                                                })
                                            })
                                        })
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
})
