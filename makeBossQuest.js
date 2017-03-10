//script to generate a random boss and its quest
//run 'node makeBossQuest.js' to generate and save a random boss and associated quest.
//add '-l' flag to designate a particular level for the boss
var mongoose = require('mongoose'),
    models = require('./models'),
    https = require('https'),
    kid = require('child_process'),
    prompt = require('prompt'),
    fs = require('fs'),
    types = ['physical', 'fire', 'ice', 'poison', 'dark', 'holy'],
    lvl = Math.floor(Math.random() * 100),
    min = 0, //note that most of these values, including min dmg, max dmg, and hp, are calculated from the monster level.
    max = 0,
    randName = 'John the Codeydude',
    startLet = String.fromCharCode(97 + Math.floor(Math.random() * 25)),
    nameCats = ['Albanian', 'Basque', 'Catalan', 'Czech', 'English', 'Esperanto', 'Danish', 'Dutch', 'Estonian', 'Faroese', 'Finnish', 'French', 'German', 'Greenlandic', 'Hawaiian', 'Hungarian', 'Icelandic', 'Irish', 'Italian', 'Latin', 'Latvian', 'Lithuanian', 'Manx', 'Maori', 'Middle_French', 'Norman', 'Northern_Sami', 'Norwegian', 'Old_French', 'Old_Irish', 'Old_Norse', 'Polish', 'Portuguese', 'Romanian', 'Scots', 'Scottish_Gaelic', 'Serbo-Croatian', 'Slovak', 'Slovene', 'Somali', 'Spanish', 'Swedish', 'Turkish', 'Vietnamese', 'Vilamovian', 'Welsh', 'West_Frisian', 'Zazaki'],
    adjs = ['large', 'bad', 'small', 'obsequious', 'strange', 'pious', 'good', 'strong', 'tough', 'malodorous', 'threatening','beautiful','ugly'],
    manualResist = false,
    prod = false,
    resist = [],
    type = Math.floor(Math.random() * types.length),
    hp = 0;
for (var i = 0; i < process.argv.length; i++) {
    if ((process.argv[i] == '-l' || process.argv[i] == '-lvl') && process.argv[i + 1] && !isNaN(parseInt(process.argv[i + 1]))) {
        lvl = parseInt(process.argv[i + 1]);
    } else if (process.argv[i] == '-r' || process.argv[i] == '-res') {
        manualResist = true;
        //resistances
        for (var j = i + 1; j < process.argv.length; j++) {
            if (isNaN(process.argv[j]) && types.indexOf(process.argv[j].toLowerCase()) > -1) {
                resist.push(types.indexOf(process.argv[j].toLowerCase()));
            } else if (!isNaN(process.argv[j]) && process.argv[j] >= 0 && process.argv[j] < 5) {
                resist.push(process.argv[j]);
            } else if (process.argv[j][0] == '-') {
                break;
            }
        }
    } else if (process.argv[i] == '-t' || process.argv[i] == '-type') {
        if (process.argv[i + 1] && isNaN(process.argv[i + 1]) && types.indexOf(process.argv[i + 1].toLowerCase()) > -1) {
            type = types.indexOf(process.argv[i + 1].toLowerCase());
        } else if (!isNaN(process.argv[i + 1]) && process.argv[i + 1] >= 0 && process.argv[i + 1] < 5) {
            type = process.argv[i + 1];
        }
    } else if (process.argv[i] == '-p' || process.argv[i] == '-prod') {
        prod = true;
    }
}
if (!manualResist) {
    var numRes = Math.floor(Math.random() * 4),
        attempts = 0;
    for (var p = 0; p < numRes; p++) {
        var testRes = false;

        while (!testRes || resist.indexOf(testRes) > -1) {
            attempts++;
            console.log(attempts)
            testRes = Math.floor(Math.random() * 6);
        }
        resist.push(testRes)
    }
}
//maaaath!
hp = Math.ceil((2.125 * lvl) + .561);
min = Math.ceil((-0.001199 * Math.pow(lvl, 5)) + (.047 * Math.pow(lvl, 4)) + (-0.653 * Math.pow(lvl, 3)) + (3.823 * Math.pow(lvl, 2)) + (-7.608 * lvl) + 6.029);
max = Math.ceil((0.003427 * Math.pow(lvl, 4)) + (-.107 * Math.pow(lvl, 3)) + (1.034 * Math.pow(lvl, 2)) + (-1.278 * lvl) + 3.991);

String.prototype.titleCase = function() {
    return this.slice(0, 1).toUpperCase() + this.slice(1);
}

https.get({
    host: 'en.wiktionary.org',
    path: '/w/api.php?action=query&list=categorymembers&cmsort=sortkey&cmlimit=500&cmtype=page&format=json&cmstartsortkeyprefix=' + startLet + '&cmtitle=Category:' + nameCats[Math.floor(Math.random() * nameCats.length)] + '_given_names'
}, function(name) {
    // Continuously update stream with data
    var nameBody = '';
    name.on('data', function(d) {
        nameBody += d;
    });
    name.on('end', function() {
        // Data reception is done, do whatever with it!
        var nameList = [];
        JSON.parse(nameBody).query.categorymembers.forEach(function(el) {
            nameList.push(el.title);

        });

        var theName = nameList[Math.floor(Math.random() * nameList.length)];
        while (!theName || theName.match(/:|\s|\.|-/)) {
            theName = nameList[Math.floor(Math.random() * nameList.length)];
        }
        var adjPik = adjs[Math.floor(Math.random() * adjs.length)];
        https.get({
            host: 'thesaurus.altervista.org',
            path: '/thesaurus/v1?language=en_US&output=json&key=e0nQdTIQUOs3zuD8vjNs&word=' + adjPik
        }, function(adjData) {
            var adjBody = ''
            adjData.on('data', function(d) {
                adjBody += d;
            })
            adjData.on('end', function() {
                adjList = [];
                // console.log(adjBody)
                JSON.parse(adjBody).response.forEach((p) => {
                    if (p.list.category == '(adj)') {
                        adjList = adjList.concat(p.list.synonyms.split('|'))
                    }
                })
                adjList = adjList.filter((a) => {
                    return a.indexOf('(antonym)') == -1
                }).map((w) => {
                    if (w.indexOf('(') > -1) {
                        return w.slice(0, w.indexOf('(') - 1)
                    } else {
                        return w;
                    }
                })
                randName = theName + ' the ' + adjList[Math.floor(Math.random() * adjList.length)].titleCase();
                resList = resist.map((x) => {
                    return types[x]
                }).join('\n  ');

                //now we just need to save all the things
                var boss = mongoose.model('Boss')(),
                    quest = mongoose.model('Quest')(),
                    kWords = ['Kill', 'Slay', 'Defeat', 'Put an end to', 'End the villainy of']
                qLvl = Math.ceil(Math.floor(Math.random() * lvl * .5) + (lvl * .66)); //level this quest occurs at
                //first, both get IDs
                boss.id = Math.floor(Math.random() * 999999999);
                quest.id = Math.floor(Math.random() * 999999999);
                //quest
                quest.name = kWords[Math.floor(Math.random() * kWords.length)] + ' ' + randName + ' on level ' + qLvl + '!';
                quest.steps.push({
                    txt: 'Kill ' + randName + '.',
                    stepNum: 0,
                    monsGoal: boss.id
                })
                quest.lvl = qLvl;

                //now, boss. like a boss    
                boss.name = randName;
                boss.lvl = lvl;
                boss.min = min;
                boss.max = max;
                boss.type = type;
                boss.hp = hp;
                boss.res = resist;
                boss.quest = quest.id;
                //can we write an auto-generator for description too?
                boss.desc = descGen(false, boss, quest, adjPik);
                quest.desc = descGen(true, boss, quest, adjPik);
                console.log(`----Your Boss:----\nName: ${randName}\nLevel:${lvl}\nDescription: ${boss.desc}\nDamage Type: ${types[type]}\nMinimum damage:${min}\nMaximum damage:${max}\nResistance(s):\n  ${resList}\n\n----Boss's Quest----\nName: ${quest.name}\nDescription: ${quest.desc}\nLevel: ${quest.lvl}`);
                prompt.start();
                var promptLocSchema = {
                        properties: {
                            confirm: {
                                description: 'Everything look okay (y/n)?',
                                required: true
                            }
                        }
                    },
                    promptLiveSchema = {
                        properties: {
                            confirm: {
                                description: 'Everything look okay (y/n)?',
                                required: true
                            },
                            password: {
                                hidden: true,
                                required: true
                            }
                        }
                    }
                if (!prod) {
                    prompt.get(promptLocSchema, function(err, resp) {
                        console.log('local user sez: ', resp);
                        if (resp.confirm.toLowerCase() == 'y' || resp.confirm.toLowerCase() == 'yes') {
                            console.log('SAVING', boss, quest)
                            boss.save(function(errBS) {
                                if (errBS) console.log('uh oh! problem saving boss:', errBS);
                                quest.save(function(errQS) {
                                    if (errQS) console.log('uh oh! problem saving quest:', errQS)
                                    process.exit(0);

                                });
                            });
                        } else {
                            process.exit(0);
                        }
                    })
                } else {
                    prompt.get(promptLiveSchema, function(err, resp) {
                        if (resp.confirm.toLowerCase() == 'y' || resp.confirm.toLowerCase() == 'yes') {
                            fs.writeFile('D:\\Data\\Projects\\maze\\seeds\\tempBoss.json', '[' + JSON.stringify(boss).replace(/"_id":"\w+",/g, '') + ']', { flags: 'w' }, function(err, res) {
                                if (err) console.log('Uh oh! trouble writing boss to file!');
                                fs.writeFile('D:\\Data\\Projects\\maze\\seeds\\tempQuest.json', '[' + JSON.stringify(quest).replace(/"_id":"\w+",/g, '') + ']', { flags: 'w' }, function(err, res) {
                                    if (err) console.log('Uh oh! trouble writing quest to file!');
                                    kid.exec('c: && cd c:\\mongodb\\bin && mongoimport -h ds011913.mlab.com:11913 -d heroku_701xzs88 -c Boss -u newms -p ' + resp.password + ' --jsonArray --file D:\\Data\\Projects\\maze\\seeds\\tempBoss.json', function(err, stdout, stderr) {
                                        if (err) {
                                            console.log('Uh oh! An error of "', err, '" prevented us from uploading this boss!');
                                            process.exit();
                                        } else {
                                            console.log('Successfully uploaded boss', boss.name)
                                        }
                                        kid.exec('c: && cd c:\\mongodb\\bin && mongoimport -h ds011913.mlab.com:11913 -d heroku_701xzs88 -c Quest -u newms -p ' + resp.password + ' --jsonArray --file D:\\Data\\Projects\\maze\\seeds\\tempQuest.json', function(err, stdout, stderr) {
                                            if (err) {
                                                console.log('Uh oh! An error of "', err, '" prevented us from uploading this quest! Please note that the boss WAS uploaded successfully.');
                                            } else {
                                                console.log('Successfully uploaded quest', quest.name)
                                            }
                                            process.exit(0)
                                        })
                                    })
                                })
                            })
                        }
                    })
                }
            })
        })
    });
});


// thesaurus.altervista.org/thesaurus/v1?language=en_US&output=json&key=e0nQdTIQUOs3zuD8vjNs&word=large
var descGen = function(m, boss, quest, adj) {
    //m: false = boss desc, true = questDesc;
    var theDesc = boss.name + ' ',
        threatsTrans = ['has been terrorizing', 'threatens', 'is a menace to', 'is someone who is just plain hated by'],
        threatsIntrans = ['lurks', 'refuses to pay their taxes', 'double-parked', 'is a menace', 'is someone who we just really do not like'],
        victims = ['a poor girl', 'a noble knight', 'a not-very-noble knight', 'a powerful king', 'a damsel in distress', 'a damsel who is really not that distressed', 'the king of a local village', 'Rodney King', 'the people of a local village', 'a dude with lots of money'],
        fiendSyns = ['fiend', 'degenerate', 'beast', 'brute', 'just simply not nice person', 'zealot'];
    if (m) {
        var trans = Math.random() > .5;
        if (trans) {
            //transitive
            var vic = victims[Math.floor(Math.random() * victims.length)];
            theDesc += threatsTrans[Math.floor(Math.random() * threatsTrans.length)] + ' ' + vic;
        } else {
            theDesc += threatsIntrans[Math.floor(Math.random() * threatsIntrans.length)]
        }
        theDesc += ' on Level ' + qLvl + ' of the dungeon! Kill the fiend, ';
        if (trans) {
            theDesc += 'and save ' + vic + '!';
        } else {
            theDesc += 'and end the threat!'
        }
        return theDesc;
    } else {
        var rez = '';
        boss.res.forEach((r, n) => {
            rez += types[r];
            if (n < boss.res.length - 2 && boss.res.length > 2) {
                rez += ', '
            } else if (n == boss.res.length - 2 && boss.res.length > 1) {
                rez += ' and ';
            }
        })
        theDesc += 'is a ' + adj + ' ' + fiendSyns[Math.floor(Math.random() * fiendSyns.length)] + ', specializing in ' + types[boss.type] + ' damage. Skirmishes against ' + boss.name.split(' ')[0] + ' have reported ';
        if (boss.res.length > 1) {
            theDesc += 'particular resistances against ' + rez + ' damage.';
        } else if (boss.res.length == 1) {
            theDesc += 'a particular resistance against ' + rez + ' damage.';
        } else {
            theDesc += 'no particular resistances against any types of damage.';
        }
        return theDesc;
    }
}
