var app = angular.module('mazeGame', ['ngTouch']).controller('log-con', function($scope, $http, $q, $timeout, $window, userFact, musFac) {
    $scope.hazLogd = false;
    $scope.musOn = true;
    $scope.user = {
        prof: '0'
    }
    musFac.createMus();
    $scope.toggleMus = function() {
        musFac.toggleMus();
        $scope.musOn = !$scope.musOn
    };
    musFac.getMusic('intro');
    $scope.profDescs = [{
        name: 'Warrior',
        txt: 'What they lack in magical apptitude, warriors more than make up for in their martial expertise. The warrior uses their weapon training to bring swift and steely death to their foes',
        img: './img/assets/war.jpg',
        ico: './img/assets/warPick.png',
        skill: "Berserker's Precision - Your martial training allows you to make more devastating attacks. Chance to cause degen to stunned foes, or stun to degening foes."
    }, {
        name: 'Sorcerer',
        txt: 'The scholarly sorcerer uses their extensive knowledge of the arcane to obliterate their enemies with magical fire, or hinder them with conjured ice and blizzards.',
        img: './img/assets/sorc.jpg',
        ico: './img/assets/sorcPick.png',
        skill: "Elemental Boon - By channeling more into your spells, you can renew yourself or devastate your enemies. Chance to grant additional regen or degen. Based on level."
    }, {
        name: 'Paladin',
        txt: 'The holy paladins are bastions of the Holy Ones. Using their faith both offensively as a shield and defensively as a weapon, they can both smite their enemies and renew themselves.',
        img: './img/assets/paly.jpg',
        ico: './img/assets/palyPick.png',
        skill: "Redemption - The paladin's fortitude gives them a chance to reflect the enemy's damage back at them. Chance to reflect enemy damage. Based on level."
    }, {
        name: 'Necromancer',
        txt: 'Masters of the so-called "dark" arts, the necromancers are an oft-maligned lot. However, no one would deny their power - or their usefulness - in turning the minds and even fallen bodies of their foes against them.',
        img: './img/assets/necro.jpg',
        ico: './img/assets/necroPick.png',
        skill: "Soul Siphon - Calling on some really dark stuff, you rend part of your enemy's life force. Chance to steal some health on attack. Based on level."
    }, {
        name: 'Aetherist',
        txt: `Eschewing both raw martial attacks and the direct elemental attacks that they see as "simplistic", this offshoot of the original mage guilds turns their enemies' attacks against them, stealing their energy and reflecting attacks with frightening precision.`,
        img: './img/assets/aether.jpg',
        ico: './img/assets/aetherPick.png',
        skill: "Energy tap - Using their knowledge of the mind, the Aetherist can steal the very stamina of their foes. Chance to steal some energy on attack."
    }]
    $scope.newUsr = function() {
        //eventually we need to CHECK to see if this user is already taken!
        //for now, we assume not
        if ($scope.regForm.pwd.$viewValue != $scope.regForm.pwdTwo.$viewValue) {
            sandalchest.alert('Your passwords don&rsquo;t match!', function() {

            });
        } else {
            var userInf = {
                user: $scope.regForm.username.$viewValue,
                password: $scope.regForm.pwd.$viewValue,
                prof: $scope.user.prof + 1
            };
            console.log('userInf', userInf)
            $http.post('/user/new', userInf).then(function(res) {
                if (res.data == 'saved!') {
                    $scope.login(true);
                }
            });
        }
    };
    $scope.passMatch = true;
    $scope.passStr = 0;
    $scope.isNew = false;
    $scope.checkPwdStr = function() {
        if ($scope.regForm.pwd.$viewValue) {

            $scope.passStr = userFact.checkPwdStr($scope.regForm.pwd.$viewValue);
        }
        console.log('pwd strength', $scope.passStr);
    };
    $scope.checkPwds = function() {
        $scope.passMatch = userFact.checkPwdMatch($scope.regForm.pwd.$viewValue, $scope.regForm.pwdTwo.$viewValue);
    };
    $scope.dupName = false;
    $scope.nameCheck = function() {
        var name = $scope.regForm.username.$viewValue;
        console.log('userFact', userFact.checkName, 'name', name);
        userFact.checkName(name).then(function(resp) {
            $scope.dupName = resp;
        });
    };
    $scope.login = function(n) {
        if (n) {
            //new user. logging them in after we've registered
            userFact.login({
                name: $scope.regForm.username.$viewValue,
                pwd: $scope.regForm.pwd.$viewValue
            }).then(function(lRes) {
                //response back from factory (and thus backend)
                //Did login succeed?
                if (lRes) {
                    $scope.hazLogd = true;
                    $scope.getNews();
                } else {
                    sandalchest.alert('Either your username or password is not correct!')
                }
            });
        } else {
            userFact.login({
                name: $scope.logForm.username.$viewValue,
                pwd: $scope.logForm.pwd.$viewValue
            }).then(function(lRes) {
                //response back from factory (and thus backend)
                //Did login succeed?
                if (lRes) {
                    $scope.hazLogd = true;
                    $scope.getNews();
                } else {
                    sandalchest.alert('Either your username or password is not correct!');
                }
            });
        }
    };
    $scope.play = function() {
        $window.location.href = ('./');
    };
    $scope.passInf = function() {
        sandalchest.alert('<h3>Password Strength</h3><hr/>Here are a few things to include for a stronger password:<ul><li>A lowercase letter</li><li>An uppercase letter</li><li>A number</li><li>A non alpha-numeric symbol (something like "@" or "$")</li></ul>Longer passwords are also generally better!');
    };
    $scope.upd = [];
    $scope.getNews = function() {
        $http.get('/other/news').then(function(res) {
            $scope.upd = res.data.split(/[\n\r]/)
        })
    };
    $scope.getNews(); //REMOVE ME!
    $scope.parseInt = parseInt; //we're exposing this on the front end so that we can do stuff like <div>{{parseInt(someNum)}}</div>
});

var socket = io();
app.controller('maze-con', function($scope, $http, $q, $interval, $timeout, $window, mazeFac, combatFac, UIFac, userFact, econFac, musFac) {
    $scope.width = 6;
    $scope.height = 6;
    $scope.path = []; //all the cells visited, in order.
    $scope.backtraceNum;
    $scope.currCell;
    $scope.bombsLeft = 5;
    $scope.cellsDone = 0;
    $scope.moveReady = false;
    $scope.cells = [];
    $scope.cellNames = []; //makes cells easier to reference.
    $scope.invActive = false;
    $scope.setActive = false;
    $scope.intTarg;
    $scope.lvl = 1;
    $scope.playerLvl = 1;
    $scope.playerItems = [];
    $scope.questList = [];
    $scope.doneQuest = [];
    $scope.maxHp = 0;
    $scope.currHp = 0;
    $scope.foggy = true;
    $scope.maxEn = 0;
    $scope.currEn = 0;
    $scope.isStunned = false;
    $scope.inCombat = false;
    $scope.merchy = {};
    $scope.beastLib = [];
    $scope.turnSpeed = 0;
    // $scope.possRoomConts = ['loot', 'mons', 'npcs', 'jewl', ' ', 'exit', ' ', ' ', 'mons', 'mons']; //things that could be in a room!
    $scope.name = ''; //actual name. 
    $scope.currSkillNum = 0;
    musFac.createMus();
    $scope.toggleMus = function() {
        musFac.toggleMus();
        $scope.musOn = !$scope.musOn
    };
    $scope.hCent = ($(window).width() - 1000)/2;//horizontal center;
    musFac.getMusic('general');
    $scope.uName = ''; //if this is blank, accept no incoming socket events from phone(s). Otherwise, accept from specified phone only! This is NOT the username of the player!
    ($scope.checkPhone = function() {
        var isMobile = false; //initiate as false
        // device detection
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;
        if (isMobile) {
            $window.location.href = './mobile';
        } else {
            //if we're NOT mobile, check to see if we're logged in
            userFact.checkLogin().then(function(resp) {
                console.log('RESPONSE FROM CHECK LOGIN:', resp);
                if (!resp) {
                    $window.location.href = './login';
                }
            });
        }
    })();
    $scope.goVote = function() {
        sandalchest.dialog(
            'Voting ',
            'Wanna submit your own ideas or vote on other user&rsquo;s ideas? Vote for them by clicking below!<hr><i>Warning!:</i> This will reset your current level progress!', {
                buttons: [{
                    text: '&#9745; Go Vote!',
                    close: false,
                    click: function() {
                        $window.location.href = './votes';
                    }
                }, {
                    text: '&#9744; Nevermind',
                    close: true
                }]
            }
        );
    };
    $scope.fillCells = function() {
        console.log('cells:', $scope.cells);
        var promBeasts = [],
            promMercs = [],
            promMercInvs = [],
            promMerchQuests = [];
        for (var i = 0; i < $scope.cells.length; i++) {
            if ($scope.cells[i].has == 'mons') {
                promBeasts.push(mazeFac.popCell($scope.lvl, $scope.cells[i].id));

            } else if ($scope.cells[i].has == 'npcs') {
                console.log($scope.cells[i].id, 'has an npc.')
                promMercs.push(econFac.getNpc($scope.cells[i].id));
            }
        }
        $q.all(promBeasts).then(function(mList) {
            mList.forEach(function(m) {
                $scope.cells[$scope.cellNames.indexOf(m.cell)].has = m.mons;
            });
            //now merchants
        });
        $q.all(promMercs).then(function(eList) {
            eList.forEach(function(r) {
                console.log('DATA INTO PROMPMERCINVS', r)
                $scope.cells[$scope.cellNames.indexOf(r.id)].has = r.data;
                if (r.data.isMerch && r.data.isMerch == true) {
                    promMercInvs.push(econFac.merchInv(r.data.inv, r.id));
                }
            });
            $q.all(promMercInvs).then(function(mercInvs) {
                mercInvs.forEach(function(inv) {
                    console.log('INV', inv);
                    $scope.cells[$scope.cellNames.indexOf(inv.id)].has.inv = inv.inv;
                    promMerchQuests.push(econFac.getQuests($scope.name, inv.id, $scope.lvl));
                });
                $q.all(promMerchQuests).then(function(mq) {
                    console.log(mq);
                    mq.forEach(function(q) {
                        $scope.cells[$scope.cellNames.indexOf(q.id)].has.quest = q.q
                        console.log('NPC HAS QUEST:', q.q, q.id)
                    });
                    var newMazeData = {
                        name: $scope.name,
                        lvl: $scope.lvl,
                        equip: $scope.playerItems,
                        questDone: $scope.questList || [],
                        inProf: $scope.doneQuest,
                        maxHp: $scope.maxHp,
                        currHp: $scope.currHp,
                        maxEn: $scope.maxEn,
                        currEn: $scope.currEn,
                        isStunned: $scope.isStunned,
                        currentLevel: {
                            loc: $scope.playerCell,
                            data: $scope.cells,
                            names: $scope.cellNames
                        }
                    };
                    UIFac.saveGame(newMazeData, false, false); //save data, do not reload.
                });
            });
        });
    };

    $scope.doMaze = function(w, h) {
        //need to change this so that we're only running this if a lvl reset/new lvl
        // mongoose
        var mazeObj = mazeFac.makeMaze(w, h);
        $scope.cells = mazeObj.cells;
        $scope.path = mazeObj.path;
        $scope.cellNames = mazeObj.names;
        $scope.bombsLeft = 5;
        $scope.moveReady = true;
        $scope.playerCell = '0-0';
        $scope.fillCells();
    };

    $scope.getUsrData = function() {
        $http.get('/user/currUsrData').then(function(d) {
            console.log('CURR USR DATA', typeof d, d);
            $scope.playerItems = d.data.equip;
            $scope.lvl = d.data.lvl;
            $scope.questList = d.data.inProg;
            $scope.doneQuest = d.data.questDone;
            $scope.maxHp = d.data.maxHp;
            $scope.currHp = d.data.currHp;
            $scope.maxEn = d.data.maxEn;
            $scope.currEn = d.data.currEn;
            $scope.isStunned = d.data.isStunned;
            $scope.name = d.data.name;
            $scope.playerLvl = d.data.playerLvl || 1;
            $scope.currXp = d.data.currLvlXp || 0;
            $scope.playerSkills = d.data.skills;
            $scope.extraSkillPts = d.data.skillPts || 0;
            $scope.prof = d.data.prof || 1;
            $scope.beastLib = d.data.mons;
            econFac.merchInv($scope.playerItems.inv).then(function(r) {
                for (var ep = 0; ep < r.length; ep++) {
                    console.log('REPLACING', $scope.playerItems.inv[ep].item, 'WITH', r[ep])
                    $scope.playerItems.inv[ep].item = r[ep];
                }
                if ((localStorage.mazeGameReset && localStorage.mazeGameReset.toString() == 'true') || !d.data.currentLevel || !d.data.currentLevel.loc || d.data.currentLevel.loc == null || d.data.currentLevel.loc == '') {
                    console.log('User does not already have level data saved!')
                    localStorage.removeItem('mazeGameReset'); //remove if we've just reset.

                    //if no level data, reset;
                    $scope.doMaze($scope.width, $scope.height);
                } else {
                    console.log('User DOES have current level data! Reloading!', d.data)
                    $scope.cells = d.data.currentLevel.data;
                    $scope.cellNames = d.data.currentLevel.names;
                    $scope.playerCell = d.data.currentLevel.loc;
                    $scope.moveReady = true;
                    $scope.$digest();
                }
                $scope.popInv();
            })
        });
    };
    $scope.getUsrData();
    $scope.getInvName = function(el) {
        var name = '';
        if (!el.item) {
            return 'ERROR!'
        } else if (el.item.name) {
            //junk!
            name = el.item.name;
        } else if (el.item.length && el.item instanceof Array && el.item.length > 2) {
            //armor or weap
            name = el.item[0].pre + ' ' + el.item[1].name + ' ' + el.item[2].post;
        }
        return name;
    }


    $scope.dmgType = combatFac.getDmgType;
    $scope.compareCell = function(id) {
        return id == $scope.playerCell;
    };
    $scope.surroundCells = function(cl) {
        var actualId = cl.id.split('-'),
            actualPlayer = $scope.playerCell.split('-'),
            theBorderClass = '';
        if ((actualId[0] - actualPlayer[0]) == -1 && (actualId[1] - actualPlayer[1]) == -1) {
            theBorderClass = 'fog-TL';
        } else if ((actualId[0] - actualPlayer[0]) == 0 && (actualId[1] - actualPlayer[1]) == -1) {
            theBorderClass = 'fog-TC';
        } else if ((actualId[0] - actualPlayer[0]) == 1 && (actualId[1] - actualPlayer[1]) == -1) {
            theBorderClass = 'fog-TR';
        } else if ((actualId[0] - actualPlayer[0]) == -1 && (actualId[1] - actualPlayer[1]) == 0) {
            theBorderClass = 'fog-CL';
        } else if ((actualId[0] - actualPlayer[0]) == 1 && (actualId[1] - actualPlayer[1]) == 0) {
            theBorderClass = 'fog-CR';
        } else if ((actualId[0] - actualPlayer[0]) == -1 && (actualId[1] - actualPlayer[1]) == 1) {
            theBorderClass = 'fog-BL';
        } else if ((actualId[0] - actualPlayer[0]) == 0 && (actualId[1] - actualPlayer[1]) == 1) {
            theBorderClass = 'fog-BC';
        } else if ((actualId[0] - actualPlayer[0]) == 1 && (actualId[1] - actualPlayer[1]) == 1) {
            theBorderClass = 'fog-BR';
        }


        if ((theBorderClass == '' && (Math.abs(actualId[0] - actualPlayer[0]) > 1 || Math.abs(actualId[1] - actualPlayer[1]) > 1)) || (theBorderClass == 'fog-TL' && (!!cl.south || !!cl.east)) || (theBorderClass == 'fog-TC' && !!cl.south) || (theBorderClass == 'fog-TR' && (!!cl.south || !!cl.west)) || (theBorderClass == 'fog-CL' && !!cl.east) || (theBorderClass == 'fog-CR' && !!cl.west) || (theBorderClass == 'fog-BL' && (!!cl.north || !!cl.east)) || (theBorderClass == 'fog-BC' && !!cl.north) || (theBorderClass == 'fog-BR' && (!!cl.north || !!cl.west))) {
            theBorderClass = 'fog-FF';
        }
        return theBorderClass;
    }
    $scope.bodyBoxes = [{
        name: 'head',
        x: 81,
        y: 1,
        imgUrl: './img/UI/head.jpg'
    }, {
        name: 'chest',
        x: 80,
        y: 115,
        imgUrl: './img/UI/chest.jpg'
    }, {
        name: 'legs',
        x: 82,
        y: 361,
        imgUrl: './img/UI/legs.jpg'
    }, {
        name: 'hands',
        x: 1,
        y: 285,
        imgUrl: './img/UI/hands.jpg'
    }, {
        name: 'feet',
        x: 79,
        y: 510,
        imgUrl: './img/UI/feet.jpg'
    }, {
        name: 'weap',
        x: 158,
        y: 284,
        imgUrl: './img/UI/weap.jpg'
    }];
    $scope.Skills = [];
    $scope.Bestiary = [];
    $scope.Quests = [];

    $scope.currUINum = 0;
    $scope.UIPans = ['Inventory', 'Skills', 'Bestiary', 'Quests', 'Menu'];
    $scope.currUIObjs = []; //we get these from the factory
    $scope.currUIBg = '../img/UI/inv.jpg';
    $scope.currUIPan = $scope.UIPans[$scope.currUINum];
    $scope.popInv = function() {
        var playerInfo = {
            lvl: $scope.playerLvl,
            done: $scope.doneQuest,
            inProg: $scope.questList,
            items: $scope.playerItems,
            xp: $scope.currXp,
            skills: $scope.playerSkills,
            chains: []
        };
        UIFac.getAllUIs(playerInfo).then(function(r) {
            //do stuff with response.
            $scope.playerSkills = r.skills;
            $scope.playerItems = r.items;
            $scope.skillChains = r.chains;
            $scope.fullSkills = r.skillsReal;
            if ($scope.inCombat) {
                angular.element('#combat-box').scope().comb.monsTurn();
            }
        })
    }
    $scope.log2 = function(n) {
        return Math.log2(n)
    };
    $scope.skillPntrCalcs = function(n, len) {
        /*triangle, where:
        base is 105*index. height is... 95?
        base is xsin(ang)
        */
        var ang = 180 - (Math.atan(105 * (len > 0 && len % 2 ? n - 1 : n) / 95) * 180 / Math.PI),
            ht = 95 / (Math.cos(Math.atan(105 * (len > 0 && len % 2 ? n - 1 : n) / 95)) * 2);
        if (len == 1) {
            ang = 180;
            ht = 45;
        }
        return {
            ang: ang,
            ht: ht
        };
    };
    $scope.didSkills = false;
    $scope.currMons = 0;
    $scope.adjBeast = function(dir) {
        console.log('DIR', dir, 'MONS', $scope.currMons)
        if (dir && $scope.currMons < $scope.currUIObjs.length - 2) {
            $scope.currMons += 2;
        } else if ($scope.currMons > 1) {
            console.log('goin backwards')
            $scope.currMons -= 2;
        }
        $scope.$digest();
    }
    $scope.chInv = function(dir) {
        //inv, skills, beastiary, quests, menu
        //UI Cycle function
        if (!dir && $scope.currUINum > 0) {
            $scope.currUINum--;
        } else if (!dir) {
            $scope.currUINum = $scope.UIPans.length - 1;
        } else if (dir == 1 && $scope.currUINum < $scope.UIPans.length - 1) {
            $scope.currUINum++;
        } else if (dir == 1) {
            $scope.currUINum = 0;
        }
        $scope.currUIPan = $scope.UIPans[$scope.currUINum]; //title of current ui panel
        if ($scope.currUIPan !== 'Menu' && $scope.currUIPan !== 'Inventory' && $scope.currUIPan !== 'Skills') {
            UIFac.getUIObj($scope.currUIPan, $scope[$scope.currUIPan]).then(function(uiRes) {
                $scope.currUIObjs = uiRes.data;
                if ($scope.currUIPan == 'Bestiary') {
                    $scope.currUIObjs.forEach(function(m) {
                        m.imgUrl = '/img' + m.imgUrl;
                    })
                    $scope.currUIObjs = $scope.currUIObjs.filter(function(m) {
                        return !m.quest && $scope.beastLib.indexOf(m._id) > -1;
                    })
                    $scope.currMons = 0;
                    $scope.$apply();
                }
            });
        } else if ($scope.currUIPan == 'Inventory') {
            UIFac.doPlayerInv($scope.playerItems, $scope.bodyBoxes).then(function(s) {
                $scope.bodyBoxes = s;
                $scope.currUIObjs = $scope.playerItems.inv;
            });
        } else if ($scope.currUIPan == 'Skills' || !$scope.didSkills) {
            // shouldnt have to do anything besides refresh
            var playerInfo = {
                lvl: $scope.playerLvl,
                done: $scope.doneQuest,
                inProg: $scope.questList,
                items: $scope.playerItems,
                xp: $scope.currXp,
                skills: $scope.playerSkills,
                chains: []
            };
            UIFac.getAllUIs(playerInfo).then(function(d) {
                $scope.skillChains = d.chains;
                console.log('chains', d.chains)
                $scope.$digest();
            })
        }

        $scope.currUIBg = UIFac.getUIBg($scope.currUIPan);
    };
    $scope.chInv(0);
    //end UI stuff
    $scope.bombOn = false;
    $scope.roomRot = 0;
    $scope.playerFacing = 0;
    window.onkeydown = function(e) {
        if ($scope.moveReady && e.which !== 73) {
            var currCell = $scope.cells[$scope.cellNames.indexOf($scope.playerCell)];
            var x = $scope.playerCell.split('-')[0];
            var y = $scope.playerCell.split('-')[1];
            var dir = 'north';
            if ($scope.playerFacing < 45 || $scope.playerFacing > 315) {
                dir = 'north';
            } else if ($scope.playerFacing >= 45 && $scope.playerFacing < 135) {
                dir = 'west';
            } else if ($scope.playerFacing >= 225 && $scope.playerFacing < 315) {
                dir = 'east';
            } else {
                dir = 'south';
            }

            var isMoveKey = false;
            var canMove = false;
            if (e.which == 87 || e.which == 38 && !$scope.moving) {
                isMoveKey = true;
                canMove = false;
                if (!currCell[dir]) {
                    canMove = true;
                } else if ($scope.bombOn) {
                    canMove = true;
                    $scope.bomb(dir);
                    $scope.bombsLeft--;
                }
                if (canMove) {
                    switch (dir) {
                        case 'north':
                            y--;
                            break;
                        case 'south':
                            y++;
                            break;
                        case 'east':
                            x++;
                            break;
                        default:
                            x--;
                    }
                }
                console.log('Attempting to move', dir);
            } else if (e.which == 83 || e.which == 40 && !$scope.moving) {
                isMoveKey = true;
                var revDir;
                switch (dir) {
                    case 'north':
                        revDir = 'south';
                        break;
                    case 'south':
                        revDir = 'north';
                        break;
                    case 'east':
                        revDir = 'west';
                        break;
                    default:
                        revDir = 'east';
                }
                canMove = false;
                if (!currCell[revDir]) {
                    canMove = true;
                } else if ($scope.bombOn) {
                    canMove = true;
                    $scope.bomb(revDir);
                    $scope.bombsLeft--;
                }
                if (canMove) {
                    switch (revDir) {
                        case 'north':
                            y--;
                            break;
                        case 'south':
                            y++;
                            break;
                        case 'east':
                            x++;
                            break;
                        default:
                            x--;
                    }
                }
            } else if (e.which == 68 || e.which == 39) {
                //turn right
                isMoveKey = true;
                $scope.roomRot -= 5;
                $scope.playerFacing = $scope.roomRot % 360 > 0 ? $scope.roomRot % 360 : 360 + $scope.roomRot % 360;
            } else if (e.which == 65 || e.which == 37) {
                //turn left
                isMoveKey = true;
                $scope.roomRot += 5;
                $scope.playerFacing = $scope.roomRot % 360 > 0 ? $scope.roomRot % 360 : 360 + $scope.roomRot % 360;
            } else if (e.which == 66 && $scope.bombsLeft && !$scope.bombOn) {
                $scope.bombOn = true;
            } else if (e.which == 66 && $scope.bombOn) {
                $scope.bombOn = false;
            } else if (e.which == 82) {
                $scope.rotOn = !$scope.rotOn;
            } else if (e.which == 192) {
                $scope.setActive = !$scope.setActive;
            }
            if (isMoveKey) {
                e.preventDefault();
            }
            if ((e.which == 87 || e.which == 38 || e.which == 83 || e.which == 40) && canMove && !$scope.moving) {
                $scope.oldCell = $scope.playerCell;
                $scope.playerCell = x + '-' + y;
                $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].pViz = true;
                $scope.intTarg = typeof $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has == 'object' && !$scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has.inv ? $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has : false;
                if ($scope.intTarg) {
                    console.log('cell cons (probly mons):', $scope.intTarg);
                    $scope.moveReady = false; //set to false since we're in combat!
                    $scope.inCombat = true;
                    musFac.getMusic('battle');
                    UIFac.saveGame({
                        name: $scope.name,
                        lvl: $scope.lvl,
                        equip: $scope.playerItems,
                        questDone: $scope.questList || [],
                        inProf: $scope.doneQuest,
                        maxHp: $scope.maxHp,
                        currHp: $scope.currHp,
                        maxEn: $scope.maxEn,
                        currEn: $scope.currEn,
                        isStunned: $scope.isStunned,
                        currentLevel: {
                            loc: $scope.playerCell,
                            data: $scope.cells,
                            names: $scope.cellNames
                        }
                    }); //saving before each combat
                    combatFac.combatReady(); //set up the board
                }
                if (typeof $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has == 'object' && $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has.inv) {
                    //cell contains an object, and that object has an inventory. Hence, a merch.
                    $scope.currNpc = $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has;
                    $scope.merchy.prepNpc();
                    $scope.isNearMerch = $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has.inv
                } else {
                    $scope.currNpc = null;
                }
                $scope.$digest();
                $scope.moveAni(); //do Move animation
            }
        } else if (e.which == 73) {
            console.log('key i was pressed');
            $scope.invActive = !$scope.invActive;
            if ($scope.invActive) {
                //disable keyboard movement while inv is open
                $scope.moveReady = false;
            } else {
                $scope.moveReady = true;
            }
            $scope.$digest();
        }
    };
    $scope.moving = false;
    $scope.moveAni = function(ex) {
        //ex: is this an exit (i.e., are we goin to the next level)?
        $scope.moving = true;
        $('body').fadeOut(500, function() {
            $('body').fadeIn(500, function() {
                $scope.moving = false;
                if (ex && ex !== 0) {
                    $scope.lvl++;
                    var data = {
                        name: $scope.name,
                        lvl: $scope.lvl,
                        equip: $scope.playerItems,
                        questDone: $scope.questList || [],
                        inProf: $scope.doneQuest,
                        maxHp: $scope.maxHp,
                        currHp: $scope.currHp,
                        maxEn: $scope.maxEn,
                        currEn: $scope.currEn,
                        isStunned: $scope.isStunned,
                        currentLevel: {
                            loc: '',
                            data: [],
                            names: []
                        }
                    };
                    console.log('new lvl!:', $scope.lvl);
                    UIFac.saveGame(data, false, true)
                }
            });
        });
    };

    window.onmousemove = function(e) {
        $scope.$digest();
        var horiz = (e.x || e.clientX) / $(window).width();
        if (Math.abs(horiz - 0.5) > 0.3) {
            var lOrR = horiz > 0.5 ? -1 : 1;
            var turnVal = (Math.abs(horiz - 0.5) - 0.3) / 0.2;
            $scope.turnSpeed = lOrR * 6 * turnVal / 1.5;

        } else {
            $scope.turnSpeed = 0;
        }
    };
    $scope.mouseTurnTimer = $interval(function() {
        $scope.roomRot += $scope.turnSpeed;
        $scope.playerFacing = $scope.roomRot % 360 > 0 ? $scope.roomRot % 360 : 360 + $scope.roomRot % 360;
    }, 50);
    $scope.threedeerooms = ['north','south','east','west']
    $scope.bomb = function(dir) {
        //because of the imprecise nature of the mazegen algorith, occasionally walls are unsolvable. this fn allows us to destroy walls, preventing trapped players.
        var x = $scope.playerCell.split('-')[0];
        var y = $scope.playerCell.split('-')[1];
        var otherDir = '';
        switch (dir) {
            case 'north':
                y--;
                otherDir = 'south';
                break;
            case 'east':
                x++;
                otherDir = 'west';
                break;
            case 'south':
                y++;
                otherDir = 'north';
                break;
            default:
                x--;
                otherDir = 'east';
        }
        var bombInCell = x + '-' + y;
        $scope.cells[$scope.cellNames.indexOf(bombInCell)][otherDir] = false;
        $scope.cells[$scope.cellNames.indexOf($scope.playerCell)][dir] = false;
        $scope.bombOn = false;
    };
    $scope.rotOn = true;
    $scope.vertRot = 5;
    $scope.getWallStatus = function(dir) {
        return !($scope.cells[$scope.cellNames.indexOf($scope.playerCell)] && $scope.cells[$scope.cellNames.indexOf($scope.playerCell)][dir])
    };
    $scope.isExit = function() {
        return $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has == 'exit';
    };
    $scope.noMove = function($event) {
        $event.stopPropagation();
    };
    $scope.floorCursor = function() {
        return $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has == 'exit' ? 'pointer' : 'auto';
    };
    $('#uiloader').draggable({ constrain: 'body' });
    $scope.inpPhone = function() {
        $scope.moveReady = false;
        sandalchest.prompt("Enter a name (you get this by visiting the site on your phone)!", function(result) {
            if (result !== null && result != ' ') {
                //as long as its not blank
                socket.emit('chkName', { n: result });
            }
            $scope.moveReady = true;
        });
    };
    socket.on('chkNameRes', function(nm) {
        if (nm.n) {
            $scope.uName = nm.n;
        }
        console.log('Name:', nm.n);
    });
    $scope.travelOkay = true;
    $scope.phoneMovTimer;
    socket.on('movOut', function(mvOb) {
        if (mvOb.n == $scope.uName) {
            var ex = null,
                ey = null;
            if (mvOb.x == 'l') {
                ex = new Event('keydown');
                ex.which = 65;
                window.onkeydown(ex);
            } else if (mvOb.x == 'r') {
                ex = new Event('keydown');
                ex.which = 68;
                window.onkeydown(ex);
            }
            //for moving forward and back, we only move every 1.0 seconds.
            if (mvOb.y == 'f' && $scope.travelOkay) {
                ey = new Event('keydown');
                ey.which = 87;
                window.onkeydown(ey);
                $scope.travelOkay = false;
                $scope.phoneMovTimer = $timeout(function() {
                    $scope.travelOkay = true;
                }, 1000);
            } else if (mvOb.y == 'b' && $scope.travelOkay) {
                ey = new Event('keydown');
                ey.which = 83;
                window.onkeydown(ey);
                $scope.travelOkay = false;
                $scope.phoneMovTimer = $timeout(function() {
                    $scope.travelOkay = true;
                }, 1000);
            }
        }
    });
    $scope.getUIInfo = function(el) {
        var name;
        console.log('getUIInfo:', el)
        if (el.item && el.item.length && el.item.length > 2) {
            //armor or weap
            name = el.item[0].pre + ' ' + el.item[1].name + ' ' + el.item[2].post;
        } else if (el.name && el.desc) {
            name = el.name;
        } else {
            //junk
            name = el.item[0].name;
        }
        var desc;
        if (el.item && el.item.length && el.item.length > 2) {
            //armor or weap
            desc = el.item[1].desc + '<br/>' + el.item[0].description + '<br/>' + el.item[2].description;
        } else if (el.name && el.desc) {
            desc = el.desc;
        } else {
            //junk
            desc = el.item[0].desc;
        }
        sandalchest.dialog(
            '<h3>' + name + '</h3>',
            '<p>' + desc + '</p><p id="moreInf" style="display:none;"></p>', {
                buttons: [{
                    text: 'Close',
                    close: true
                }, {
                    text: 'More Info',
                    close: false,
                    click: function() {
                        if ($('#moreInf').css('display') == 'none') {
                            UIFac.moreInfo(el);
                        } else {
                            UIFac.lessInf();
                        }
                        return false;
                    }
                }]
            }
        );
    };
    $scope.skillPurchUI = function(data, owned) {
        var title = `<h3>${data.name}</h3>`,
            desc = '<p>' + data.desc + '<p id="moreInf" style="display:none;"></p><hr/><table class="table"><tr><td>This skill costs:</td><td>' + data.skillPts + ' pts</td></tr><tr><td>You have:</td><td>' + $scope.extraSkillPts + ' pts</td></tr></table>',
            opts = {},
            badAns = ['Nevermind', 'Okay', 'I knew that...', 'Next time, then.', 'I&rsquo;ll return!', 'Another time, then.'],
            goodAns = ['Gimme that!', 'Do it!', 'I want that!', 'Okay!', 'Buy it!', 'Heck yes!'],
            nvms = ['Nevermind', 'On second thought...', 'Cancel', 'Actually, nah.', 'Nah', 'Heck no!'];
        if (owned) {
            //player already owns this skill, so just an 'okay' button
            desc += 'You already own this skill!';
            opts.buttons = [{ text: badAns[Math.floor(Math.random() * badAns.length)], close: true }, {
                text: 'More Info',
                close: false,
                click: function() {
                    if ($('#moreInf').css('display') == 'none') {
                        UIFac.moreInfo(data);
                    } else {
                        UIFac.lessInf();
                    }
                    return false;
                }
            }];
        } else if (!owned && data.skillPts > $scope.extraSkillPts) {
            //user cannot afford this
            desc += 'You cannot afford this skill!';
            opts.buttons = [{ text: badAns[Math.floor(Math.random() * badAns.length)], close: true }, {
                text: 'More Info',
                close: false,
                click: function() {
                    if ($('#moreInf').css('display') == 'none') {
                        UIFac.moreInfo(data);
                    } else {
                        UIFac.lessInf();
                    }
                    return false;
                }
            }];
        } else {
            //okay to buy!
            desc += 'Are you sure you want to purchase this skill?';
            opts.buttons = [{
                text: goodAns[Math.floor(Math.random() * goodAns.length)],
                close: true,
                click: function() {
                    UIFac.buySkill(data, $scope.name).then(function(r) {
                        if (r) {
                            console.log('Bought skill', data.name)
                            $scope.getUsrData(); //refresh data, since we bought a new skill (and thus need to refresh the skill db.)
                            return true;
                        }
                    })
                }
            }, {
                text: nvms[Math.floor(Math.random() * nvms.length)],
                close: true
            }, {
                text: 'More Info',
                close: false,
                click: function() {
                    if ($('#moreInf').css('display') == 'none') {
                        UIFac.moreInfo(data);
                    } else {
                        UIFac.lessInf();
                    }
                    return false;
                }
            }];
        }
        console.log(title, desc, opts)
        sandalchest.dialog(title, desc, opts);
    };
    $scope.levelDown = function() {
        //TO DO: this needs to be dependent on quest statuses (i.e., certain quests block it). it also needs to send data back to Mongo to update what level the player's on.
        sandalchest.confirm('Ready to go to the next level?', function(res) {
            if (res && res !== null) {
                $scope.moveAni(1);
            }
        });
    };
    $scope.saveGame = function(reload) {
        var data = {
            name: $scope.name,
            lvl: $scope.lvl,
            equip: $scope.playerItems,
            questDone: $scope.questList || [],
            inProf: $scope.doneQuest,
            maxHp: $scope.maxHp,
            currHp: $scope.currHp,
            maxEn: $scope.maxEn,
            currEn: $scope.currEn,
            isStunned: $scope.isStunned,
            currentLevel: {
                loc: $scope.playerCell,
                data: $scope.cells,
                names: $scope.cellNames
            }
        };
        console.log('save data to ui fac:', data)
        UIFac.saveGame(data, false, reload); //save the game with the updated data. optional reset and reload
    };
    $scope.saveAndLogout = function() {
        var data = {
            name: $scope.name,
            lvl: $scope.lvl,
            equip: $scope.playerItems,
            questDone: $scope.questList || [],
            inProf: $scope.doneQuest,
            maxHp: $scope.maxHp,
            currHp: $scope.currHp,
            maxEn: $scope.maxEn,
            currEn: $scope.currEn,
            isStunned: $scope.isStunned,
            currentLevel: {
                loc: $scope.playerCell,
                data: $scope.cells,
                names: $scope.cellNames
            }
        };
        UIFac.saveGame(data, true, false);
    };
    $scope.logout = UIFac.logout;
    $scope.reset = UIFac.reset;
    $scope.resetLevel = function() {
        sandalchest.confirm('Reset Level', 'Are you sure you want to reset this level? Doing so will re-randomize the level!', function(resp) {
            if (resp) {
                localStorage.mazeGameReset = true;
                $window.location.reload();
            }
        })
    };
    $scope.trunc = function(n) {
        return Math.floor(n * 10) / 10;
    };
    $scope.isNearMerch = false; //only active if we're in a room with a merchant
    $scope.equipItem = function(el, numb) {
        if (el.lootType == 2) {
            alert('JUNK REWARD');
            return;
        }
        console.log('EL', el)
        var whereNum = el.item && el.item[1] && typeof el.item[1].slot !== 'undefined' ? el.item[1].slot : -1;
        if (el.item && el.item.length > 2 && whereNum != -1) {
            //armor!
        } else if (el.item && el.item.length > 2) {
            whereNum = 5;
        } else {
            //probly junk
            return;
        }
        var oldItem = angular.copy($scope.bodyBoxes[whereNum]); //have to do something with this later. DUNNO WAT
        var oldItemInv = {
            lootType: oldItem.name == 'weap' ? 1 : 0,
            item: angular.copy(oldItem.itFullInfo),
            num: 1
        };
        $scope.bodyBoxes[whereNum].itFullInfo = el.item;
        $scope.bodyBoxes[whereNum].itName = $scope.bodyBoxes[whereNum].itFullInfo[0].pre + ' ' + $scope.bodyBoxes[whereNum].itFullInfo[1].name + ' ' + $scope.bodyBoxes[whereNum].itFullInfo[2].post;
        //now copy to player legs!
        console.log('LOCATOR', whereNum, 'NAME:', $scope.bodyBoxes[whereNum].name, 'FROM', $scope.bodyBoxes[whereNum], 'TO', $scope.playerItems[$scope.bodyBoxes[whereNum].name], 'OLD ITEM:', oldItem);
        for (var i = 0; i < $scope.playerItems[$scope.bodyBoxes[whereNum].name].length; i++) {

            $scope.playerItems[$scope.bodyBoxes[whereNum].name][i] = $scope.bodyBoxes[whereNum].itFullInfo[i].num;
        }
        //now remove that item from inv
        var derp = $scope.playerItems.inv.splice(numb, 1);
        //and add old item (that we just unequipped) to inv
        if (typeof oldItemInv.item !== 'undefined') {
            $scope.playerItems.inv.push(oldItemInv);
        }
        UIFac.doPlayerInv($scope.playerItems, $scope.bodyBoxes).then(function(s) {
            $scope.bodyBoxes = s;
            $scope.currUIObjs = $scope.playerItems.inv;
        });
    }
    $scope.contMenOn = false;
    window.oncontextmenu = function(e) {
        if ($scope.currUIPan == "Inventory" && e.target.className == 'currUIEl ng-binding ng-scope') {
            e.preventDefault();
            e.stopPropagation();
            $scope.contMenOn = UIFac.getContMen(angular.element(e.target).scope(), e.x, e.y);
            $scope.$apply();

        }
    }
    window.onclick = function(e) {
        console.log(e.target, e.target.id, e.target.id == 'contexMen')
        if ((!e.button || e.button === 0) && e.target.id != 'contexMen') {
            $scope.contMenOn = false;
        }
    }
    $scope.trashItem = function(el, numb) {
        sandalchest.confirm('Are you sure you wish to destroy this ' + (el.item.length > 1 ? el.item[0].pre + ' ' + el.item[1].name + ' ' + el.item[2].post : el.item[0].name) + '?', function(res) {
            console.log('RES', res, el.name);
            if (res && res !== null) {
                $scope.playerItems.inv.splice(numb, 1);
                UIFac.doPlayerInv($scope.playerItems, $scope.bodyBoxes).then(function(s) {
                    $scope.bodyBoxes = s;
                    $scope.currUIObjs = $scope.playerItems.inv;
                });
            }
        });
    }
});

app.controller('mob-con', function($scope, $http, $q, $interval, $swipe, $window, UIFac) {
    $scope.currRotX = 0;
    $scope.currRotY = 0;
    $scope.rotX = null;
    $scope.rotY = null;
    $scope.uName = 'retrieving...'; //username!
    $scope.uiOpts = ['Inventory', 'Skills', 'Bestiary', 'Quests', 'Menu'];
    $scope.prevUI = 'Quests';
    $scope.currUI = 'Menu';
    $scope.nextUI = 'Inventory'
    $scope.uiObjs = []; //items in current ui menu
    $scope.getUn = function() {
        var nounStart = String.fromCharCode(65 + Math.floor(Math.random() * 25));
        var adjStart = String.fromCharCode(65 + Math.floor(Math.random() * 25));
        $.ajax({
            dataType: 'jsonp',
            url: 'https://simple.wiktionary.org/w/api.php?action=query&list=categorymembers&format=json&cmsort=sortkey&cmstartsortkeyprefix=' + nounStart + '&cmlimit=500&cmtitle=Category:Nouns',
            success: function(nounRes) {
                var noun = ' ';
                while (noun.indexOf(' ') != -1) {
                    noun = nounRes.query.categorymembers[Math.floor(Math.random() * nounRes.query.categorymembers.length)].title;
                }
                //got the noun. Now the adjective!
                console.log('final noun:', noun);
                $.ajax({
                    dataType: 'jsonp',
                    url: 'https://simple.wiktionary.org/w/api.php?action=query&list=categorymembers&format=json&cmsort=sortkey&cmstartsortkeyprefix=' + adjStart + '&cmlimit=500&cmtitle=Category:Adjectives',
                    success: function(adjRes) {
                        var adj = ' ';
                        while (adj.indexOf(' ') != -1) {
                            adj = adjRes.query.categorymembers[Math.floor(Math.random() * adjRes.query.categorymembers.length)].title;
                        }
                        $scope.uName = adj.toLowerCase() + ' ' + noun.toLowerCase();
                        $scope.movObj.n = $scope.uName;
                        //basically just to register name
                        socket.emit('movData', $scope.movObj);
                        $scope.$digest();
                    }
                });
            }
        });
    };
    $scope.getUn();
    $scope.sendMove = $interval(function() {
        if ($scope.uName != 'retrieving...' && $scope.isMoving) {
            //if we've registered a username and there is a movement to be submitted
            socket.emit('movData', $scope.movObj);
        }
    }, 75);
    $scope.isMoving = false;
    $scope.movObj = {
        x: $scope.rotX,
        y: $scope.rotY,
        n: null
    };
    $window.addEventListener('deviceorientation', function($event) {
        //i may eventually disable this for mobile use
        if ($scope.uName != 'retrieving...') {
            var rotX = Math.floor(($event.gamma / 90) * 120);
            var rotY = Math.floor(($event.beta / 90) * 120);
            $scope.isMoving = false;
            if (rotX > 50) {
                $scope.rotX = 'r';
                $scope.isMoving = true;
            } else if (rotX < -50) {
                $scope.rotX = 'l';
                $scope.isMoving = true;
            } else {
                $scope.rotX = null;
            }
            if (rotY < -35) {
                $scope.rotY = 'f';
                $scope.isMoving = true;
            } else if (rotY > 35) {
                $scope.rotY = 'b';
                $scope.isMoving = true;
            } else {
                $scope.rotY = null;
            }
            $scope.movObj = {
                x: $scope.rotX,
                y: $scope.rotY,
                n: $scope.uName
            };
        }
    });
    $scope.ringSize = 275;
    $scope.currRingRot = 0;
    $scope.rngChTimer;
    $scope.rngChOkay=true;
    $scope.ringChAni = function(newR, oldR) {
        if(!$scope.rngChOkay){
            return false;
        }
        if ([].slice.call($('.RingUIEl')).length) {
            $('.RingUIEl').animate({ transform: "rotateY(0deg) translateZ(" + $scope.ringSize + "px);" }, {
                duration: 500,
                complete: function() {

                    $scope.currUI = $scope.uiOpts[newR];
                    console.log('switched from', $scope.uiOpts[oldR], 'to', $scope.uiOpts[newR])
                    if (newR < oldR) {
                        //goin up!
                        $scope.nextUI = $scope.uiOpts[oldR];
                        if (oldR) {
                            $scope.prevUI = $scope.uiOpts[oldR - 1];
                        } else {
                            $scope.prevUI = $scope.uiOpts[$scope.uiOpts.length - 1];
                        }
                    } else {
                        //goin down!
                        $scope.prevUI = $scope.uiOpts[oldR];
                        if (newR < $scope.uiOpts.length - 2) {
                            $scope.nextUI = $scope.uiOpts[newR + 1];
                        } else {
                            $scope.nextUI = $scope.uiOpts[0];
                        }
                    }
                    console.log('NEW UI OBJECTS:', UIFac.getRingObjs(newR))
                    console.log('num ui objs')
                    $scope.currRingRot = 0;
                    var rData = UIFac.getRingObjs(newR);
                    console.log('DATA', rData)
                    $scope.uiObjs = rData.objs;
                    $scope.rotPer = rData.rot;
                }
            });
        } else {
            //no previous ring. First time loading
            $scope.currUI = $scope.uiOpts[newR];
            console.log('switched from', $scope.uiOpts[oldR], 'to', $scope.uiOpts[newR])
            if (newR < oldR) {
                //goin up!
                $scope.nextUI = $scope.uiOpts[oldR];
                if (oldR) {
                    $scope.prevUI = $scope.uiOpts[oldR - 1];
                } else {
                    $scope.prevUI = $scope.uiOpts[$scope.uiOpts.length - 1];
                }
            } else {
                //goin down!
                $scope.prevUI = $scope.uiOpts[oldR];
                if (newR < $scope.uiOpts.length - 2) {
                    $scope.nextUI = $scope.uiOpts[newR + 1];
                } else {
                    $scope.nextUI = $scope.uiOpts[0];
                }
            }

            console.log('NEW UI OBJECTS:', UIFac.getRingObjs(newR))
            console.log('num ui objs')
            $scope.currRingRot = 0;
            var rData = UIFac.getRingObjs(newR);
            console.log('DATA', rData)
            $scope.uiObjs = rData.objs;
            $scope.rotPer = rData.rot;
        }
        $scope.rngChOkay=false;
        $scope.rngChTimer = setTimeout(function(){
            $scope.rngChOkay = true;
        },1000)
    }
    $scope.uiObjs = UIFac.getRingObjs(0);
    $scope.chMenRng = function(dir) {
        //change the entire ring.
        var currMenItem = $scope.uiOpts.indexOf($scope.currUI);
        var oldRing = currMenItem;
        if (dir && dir !== 0) {
            if (currMenItem < $scope.uiOpts.length - 1) {
                currMenItem++;
            } else {
                currMenItem = 0;
            }
        } else {
            if (currMenItem && currMenItem !== 0) {
                currMenItem--;
            } else {
                currMenItem = $scope.uiOpts.length - 1;
            }
        }
        console.log('changing menu ring:', dir, currMenItem, oldRing)
        $scope.ringChAni(currMenItem, oldRing); //send this to an animation function so we fade out and fade in the rings!
    };
    $scope.oldX;
    $scope.oldY;
    $scope.noScroll = function(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.cancelBubble = true;
        e.returnValue = false;
    };
    $scope.parseTouch = function(e) {
        $scope.noScroll(e);
        if (!$scope.oldX || !$scope.oldY) {
            $scope.oldX = e.x;
            $scope.oldY = e.y;
            return false; //no previous pos data, so just end
            //a 'if unwanted condition: return false' construction like this is known as "Short-Circuiting"
        }
        var dx = e.x - $scope.oldX,
            dy = e.y - $scope.oldY;
        $scope.oldX = e.x;
        $scope.oldY = e.y;
    
        if (Math.abs(dx) > Math.abs(dy)) {

                //horizontal movement (spin rings)
            $scope.currRingRot = UIFac.PlatinumSpinningRings($scope.currRingRot, dx);
        } else if (Math.abs(dy) > 10) {

            $scope.chMenRng(dy > 0 ? 0 : 1);
        } else {
            return false;
        }
    }
    $scope.chMenRng(1); //we run this once by default to get our current ring's stuff
    $scope.chMenRng(1);
    $swipe.bind($('body#mob'), { 'move': $scope.parseTouch });


});

app.factory('combatFac', function($http) {
    var dmgTypes = ['Physical', 'Fire', 'Ice', 'Poison', 'Dark', 'Holy'];
    return {
        getDmgType: function(typeNum) {
            return dmgTypes[parseInt(typeNum)];
        },
        combatReady: function() {
            //just set up the health/energy bars
            $('#combat-box #enemy .health-bar .stat-bar-stat').css('width', '100%');
            $('#combat-box #player .health-bar .stat-bar-stat').css('width', '100%');
            $('#combat-box #player .energy-bar .stat-bar-stat').css('width', '100%');
        },
        getSkillInf: function(all, n) {
            sandalchest.dialog( all[n].name,all[n].desc, { buttons: [{ text: 'Okay', close: true }] })
        },
        getItems: function() {
            return $http.get('/item/allItems').then(function(s) {
                return s;
            })
        },
        rollLoot: function(mons) {
            return $http.get('/item/byLvl/' + mons.lvl).then(function(i) {
                return i.data;
            })
        },
        addXp: function(u,x,c,l){
            return $http.post('/user/addXp',{xp:x,user:u,cells:c,loc:l},function(r){
                return r;
            })
        },
        besties:function(data){
            return $http.post('/user/addBeast',data).then(function(r){
                return r.data;
            })
        }
    };
});

app.controller('comb-con', function($scope, $http, $q, $timeout, $window, combatFac, musFac) {
    //this is only in the subfolder because it's a subcomponent of the main controller (main.js)
    $scope.comb = {};
    $scope.comb.playersTurn = false; //monster goes first!
    $scope.comb.itemStats;
    $scope.comb.attackEffects = [];
    $scope.inCombat = true;
    $scope.comb.lastDefeated = null;
    $scope.reflStatus = {
        amt: 0,
        types: []
    }
    $scope.comb.prepComb = function() {
        $scope.comb.lastDefeated = $scope.intTarg.name
        $scope.comb.battleStatus = {
            status: false,
            title: 'NONE',
            txt: 'NONE',
            btn: 'YOU SHOULD NOT BE HERE'
        };
        $scope.intTarg.currHp = $scope.intTarg.hp; //set ens current health to max. 
        //this is reset every time we 're-enter' the cell
        $('.pre-battle').hide(250);
        console.log('MONSTER ID:', $scope.$parent.intTarg);
        combatFac.besties({ id: $scope.$parent.intTarg._id, u: $scope.$parent.name }).then(function(b) {
            $scope.beastLib = b;
            console.log('BEASTLIB', $scope.beastLib)
            combatFac.getItems().then(function(r) {
                $scope.comb.itemStats = r.data;
                $scope.currPRegens = [];
                $scope.currPDegens = [];
                $scope.currMRegens = [];
                $scope.currMDegens = [];
                $scope.popInv();
            });
        })
    };
    $scope.comb.skillCh = function(dir) {
        console.log('prev skill:', $scope.$parent.fullSkills)
        if (dir) {
            if ($scope.currSkillNum < $scope.$parent.fullSkills.length - 1) {
                $scope.currSkillNum++;
            } else {
                $scope.currSkillNum = 0;
            }
        } else {
            if ($scope.currSkillNum > 0) {
                $scope.currSkillNum--;
            } else {
                $scope.currSkillNum = $scope.$parent.fullSkills.length - 1;
            }
        }
    }
    $scope.currPRegens = [];
    $scope.currPDegens = [];
    $scope.currMRegens = [];
    $scope.currMDegens = [];
    $scope.monsStunned = false;
    $scope.comb.fleeMult = 1; //this is only increased if player fleez.
    $scope.pStunned = false;
    $scope.comb.showSkillInf = function() {
        combatFac.getSkillInf($scope.$parent.fullSkills, $scope.currSkillNum);
    }
    $scope.comb.attemptFlee = function() {
        //user attempting to run
        $scope.comb.fleeMult = 1;
        //calculate (and cap) the level difference multiplier
        //this does not change the chance that the user will be able to flee, but rather the damage that occurs if they fail to.
        if ($scope.$parent.intTarg.lvl / $scope.lvl > 3) {
            $scope.comb.fleeMult = 4;
        } else if ($scope.$parent.intTarg.lvl / $scope.lvl < .2) {
            $scope.comb.fleeMult = 1.2;
        } else {
            $scope.comb.fleeMult = 1 + ($scope.$parent.intTarg.lvl / $scope.lvl);
        }
        //i may change this flee chance to be more dynamic later, so that it's dependent on something like HP or something.
        if (Math.random() > .7) {
            //flee successful!
            $scope.comb.fleeMult = 1;
            $scope.comb.flee();
        } else {
            //flee unsuccessful.
            sandalchest.alert('You attempt to flee the ' + $scope.intTarg.name + ', but fail! It attacks!', function(r) {
                $scope.comb.playersTurn = false;
                $scope.comb.monsTurn();
            })
        }

    }
    $scope.comb.wait = function() {
        //user does nothing
        $scope.comb.updateDoTs();
        if ($scope.currHp <= 0) {
            //FATALITY! Monster wins!
            $scope.comb.dieP();
        } else {
            $scope.comb.playersTurn = false;
            $scope.comb.monsTurn();
        }
    }
    $scope.comb.attack = function() {
        //player taking turn!
        $scope.comb.attackEffects = [];
        $scope.comb.xfx = [];
        var pDmg = parseInt($scope.comb.calcDmg(1));
        $scope.intTarg.currHp -= pDmg;
        $scope.comb.updateDoTs();
        //check for aeth refls
        if ($scope.$parent.fullSkills[$scope.currSkillNum].reflect && $scope.$parent.fullSkills[$scope.currSkillNum].reflect > 0) {
            $scope.reflStatus.amt = $scope.$parent.fullSkills[$scope.currSkillNum].reflect;
            $scope.reflStatus.types = $scope.$parent.fullSkills[$scope.currSkillNum].convert;
            $scope.comb.xfx.push(`It created an ethereal shield around you, allowing you to reflect ${$scope.$parent.fullSkills[$scope.currSkillNum].reflect}% of your foe's dmg`)
        }
        if ($scope.$parent.fullSkills[$scope.currSkillNum].enSteal && $scope.$parent.fullSkills[$scope.currSkillNum].enSteal > 0 && $scope.$parent.intTarg.en) {
            //skill steals energy
            var amtToSteal = $scope.$parent.fullSkills[$scope.currSkillNum].enSteal;
            if (amtToSteal > $scope.$parent.intTarg.en) {
                amtToSteal = $scope.$parent.intTarg.en
            }
            $scope.currEn += amtToSteal;
            $scope.$parent.currEn = $scope.currEn;
            $scope.$parent.intTarg.en -= amtToSteal;

        }
        var attackInfoStr = 'You attack for ' + pDmg + ' ' + combatFac.getDmgType($scope.$parent.fullSkills[$scope.currSkillNum].type) + ' damage, using ' + $scope.$parent.fullSkills[$scope.currSkillNum].name + '!';
        if ($scope.comb.attackEffects.length) {
            //add special effects!
            var novaHit = $scope.comb.attackEffects == 'nova';
            if (novaHit) $scope.comb.attackEffects.shift();
            var efStr = ' Your attack is a ';
            for (var i = 0; i < $scope.comb.attackEffects.length - 1; i++) {
                efStr += $scope.comb.attackEffects[i] + ', ';
            }
            efStr += $scope.comb.attackEffects.length > 1 ? 'and ' + $scope.comb.attackEffects[$scope.comb.attackEffects.length - 1] + ' one.' : $scope.comb.attackEffects[$scope.comb.attackEffects.length - 1] + ' one.';
            attackInfoStr += efStr + ' ' + $scope.comb.xfx.join('');
        }
        sandalchest.alert(attackInfoStr, function(r) {
            if ($scope.intTarg.currHp <= 0) {
                //FATALITY! Player wins!
                $scope.comb.dieM();
            } else {
                $scope.comb.playersTurn = false;
                $scope.comb.monsTurn();
            }
        })

    }
    $scope.comb.DoT = function(name, amt, dur) {
        this.dur = typeof dur !== 'undefined' ? dur : 5;
        this.name = name;
        this.amt = amt;
    }
    $scope.comb.checkDoTDup = function(arr, name) {
        //check to see if this damage-over-time obj is already in the list.
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].name == name) {
                return false;
            }
        }
        return true;
    }
    $scope.resetDoTDur = function(arrName, name, dur) {
        for (var i = 0; i < $scope[arrName].length; i++) {
            if ($scope[arrName][i].name == name) {
                $scope[arrName][i].dur = typeof dur !== 'undefined' ? dur : 5;
                break;
            }
        }
    }
    $scope.comb.xfx = [];
    var findItem = function(n, a) {
        for (var i = 0; i < a.length; i++) {
            if (a[i].num == n) {
                return a[i];
            }
        }
    }
    $scope.comb.calcDmg = function(d) {
        //first, get player items:
        
        var allWeaps = $scope.comb.itemStats[1],
            allArm = $scope.comb.itemStats[0],
            allAff = $scope.comb.itemStats[2],
            allJunk = $scope.comb.itemStats[3];
        console.log('WEAP IDS', $scope.playerItems.weap, 'WEAPS', allWeaps, 'ARMOR', allArm, 'AFFIXES', allAff, 'JUNK', allJunk)
        var playerWeap = $scope.playerItems.weap;
        if (typeof playerWeap[0] == 'number') {
            playerWeap[0] = findItem(playerWeap[0], allAff);
            playerWeap[1] = findItem(playerWeap[1], allWeaps);
            playerWeap[2] = findItem(playerWeap[2], allAff);
        }
        console.log('PLAYER WEAPON:', playerWeap)
        var playerArmor;
        var dtype,
            totalRawD = 0,
            totalRawA = 0,
            activeRes = false,
            dmg,
            lvlDif;
        //calculate (and cap) the level difference multiplier

        if ($scope.$parent.intTarg.lvl / $scope.lvl > 2) {
            lvlDif = 2;
        } else if ($scope.$parent.intTarg.lvl / $scope.lvl < .5) {
            lvlDif = .5;
        } else {
            lvlDif = $scope.$parent.intTarg.lvl / $scope.lvl;
        }
        //d=direction (to or from player). True = from player (player attacking). False = to player (monster attacking)
        if (d) {
            if (!$scope.pStunned && $scope.$parent.fullSkills[$scope.currSkillNum].energy <= $scope.currEn) {
                //player is attacking monster, so we take the PLAYER'S dmg and the MONSTER'S armor
                dtype = $scope.$parent.fullSkills[$scope.currSkillNum].type;
                //note that suffix mod dmg type takes precidence. SO a Firey axe of Ice will do COLD damge, not FIRE
                if (playerWeap[0].dmgType != -1) {
                    dtype = playerWeap[0].dmgType
                }
                if (playerWeap[2].dmgType != -1) {
                    dtype = playerWeap[2].dmgType
                }
                var weapDmg = playerWeap ? Math.floor(Math.random() * (playerWeap[1].max - playerWeap[1].min)) + playerWeap[1].min : 0;
                if (Math.random() < playerWeap[0].brut || Math.random() < playerWeap[2].brut) {
                    //check for 'brutal' modifier
                    weapDmg *= 1.7;
                    $scope.comb.attackEffects.push('brutal');
                }
                var skillDmg = $scope.$parent.fullSkills[$scope.currSkillNum].burst;
                console.log('ATTACKED USING A SKILL')
                console.log('SKILL WAS:', $scope.$parent.fullSkills[$scope.currSkillNum])
                    //for degen/regen, we basically wanna check to see if this particular degen (identified by monster name, skill name, and the -degen or -regen flag) is already in the list
                if ($scope.$parent.fullSkills[$scope.currSkillNum].degen) {
                    //add monster degen
                    var crueDur = Math.random() < playerWeap[0].crue || Math.random() < playerWeap[2].crue ? 10 : 5;
                    if (crueDur > 5) $scope.comb.attackEffects.push('cruel');
                    if ($scope.comb.checkDoTDup($scope.currMDegens, $scope.$parent.intTarg.name + '-' + $scope.$parent.fullSkills[$scope.currSkillNum].name + '-degen')) {
                        $scope.currMDegens.push(new $scope.comb.DoT($scope.$parent.intTarg.name + '-' + $scope.$parent.fullSkills[$scope.currSkillNum].name + '-degen', $scope.$parent.fullSkills[$scope.currSkillNum].degen, crueDur));
                    } else {
                        //this particular DoT is already in the list, so reset its duration to 5.
                        $scope.resetDoTDur('currMDegens', $scope.$parent.intTarg.name + '-' + $scope.$parent.fullSkills[$scope.currSkillNum].name + '-degen', crueDur)
                    }
                }
                if ($scope.$parent.fullSkills[$scope.currSkillNum].regen) {
                    //add player regen
                    var rejuvDur = Math.random() < playerWeap[0].rejuv || Math.random() < playerWeap[2].rejuv ? 10 : 5;
                    if (rejuvDur > 5) $scope.comb.attackEffects.push('rejuvenating');
                    if ($scope.comb.checkDoTDup($scope.currPRegens, 'player-' + $scope.$parent.fullSkills[$scope.currSkillNum].name + '-regen')) {
                        $scope.currPRegens.push(new $scope.comb.DoT('player-' + $scope.$parent.fullSkills[$scope.currSkillNum].name + '-regen', $scope.$parent.fullSkills[$scope.currSkillNum].regen, rejuvDur));
                    } else {
                        //this particular DoT is already in the list, so reset its duration to 5.
                        $scope.resetDoTDur('currPRegens', 'player-' + $scope.$parent.fullSkills[$scope.currSkillNum].name + '-regen', rejuvDur)
                    }
                }
                if ($scope.$parent.fullSkills[$scope.currSkillNum].heal) {
                    var beneMult = Math.random() < playerWeap[0].bene || Math.random() < playerWeap[2].bene ? 2 : 1;
                    if (rejuvDur > 5) $scope.comb.attackEffects.push('benedictive');
                    $scope.currHp += $scope.$parent.fullSkills[$scope.currSkillNum].heal * beneMult;
                    if ($scope.currHp > $scope.maxHp) {
                        $scope.currHp = $scope.maxHp
                    }
                }
                if ($scope.$parent.fullSkills[$scope.currSkillNum].stuns || Math.random() < playerWeap[0].stunCh || Math.random() < playerWeap[2].stunCh) {
                    $scope.monsStunned = true;
                    $scope.comb.attackEffects.push('stunning');
                }
                //calculate optional nova damage
                var novaDmg = Math.random() < playerWeap[0].novaChance || Math.random() < playerWeap[2].novaChance ? weapDmg * .5 : 0;
                if (novaDmg) $scope.comb.attackEffects.unshift('nova');
                //check for nova resistance
                if ($scope.intTarg.res.indexOf(playerWeap[0].novaType) != -1 || $scope.intTarg.res.indexOf(playerWeap[1].novaType) != -1) {
                    novaDmg = Math.floor(novaDmg / 3);
                }
                if (Math.random() < playerWeap[0].conf || Math.random() < playerWeap[2].conf) {
                    // Confusion: gives monster a 50% chance of damaging itSELF. 
                    $scope.monsConf = true;
                    $scope.comb.attackEffects.push('confusing');
                }
                if (playerWeap[0].vamp > 0 || playerWeap[2].vamp > 0) {
                    //vampiric: heal 5-15% weap dmg this strike
                    $scope.comb.attackEffects.push('life-stealing');
                    var vampPerc = (.1 * Math.random()) + .05; //percentage healed this strike;
                    $scope.currHp += (weapDmg + skillDmg) * vampPerc;
                    if ($scope.currHp > $scope.maxHp) {
                        $scope.currHp = $scope.maxHp
                    }
                }
                $scope.currEn -= $scope.$parent.fullSkills[$scope.currSkillNum].energy;
                console.log('dmg components', skillDmg, weapDmg, novaDmg)
                var totalDmg = skillDmg + weapDmg + novaDmg;
                var aethEnSteal = $scope.$parent.prof == 5 && Math.random() > .5;
                //extraFx stuff.
                if ($scope.monsStunned && $scope.$parent.fullSkills[$scope.currSkillNum].extraFx && $scope.$parent.fullSkills[$scope.currSkillNum].extraFx.dmgVsStun) {
                    totalDmg *= (1 + Math.random() * .7);
                    $scope.comb.xfx.push('It did extra damage to your stunned foe. ');
                }
                if ($scope.currMDegens.length && $scope.$parent.fullSkills[$scope.currSkillNum].extraFx && $scope.$parent.fullSkills[$scope.currSkillNum].extraFx.dmgVsDegen) {
                    totalDmg *= (1 + Math.random() * .7);
                    $scope.comb.xfx.push('It did extra damage since your foe&rsquo;s suffering from degen. ');
                }
                if ($scope.$parent.fullSkills[$scope.currSkillNum].extraFx && $scope.$parent.fullSkills[$scope.currSkillNum].extraFx.critChance) {
                    totalDmg *= (1 + Math.random() * .5);
                    $scope.comb.xfx.push('It hit for extra critical damage.');
                }
                if ($scope.$parent.fullSkills[$scope.currSkillNum].extraFx && $scope.$parent.fullSkills[$scope.currSkillNum].extraFx.protection) {
                    $scope.pProt = true;
                    $scope.comb.xfx.push('Using the skill applied protection for one turn!');
                }
                if (aethEnSteal){
                    $scope.comb.xfx.push('It stole energy from your foe!')
                }
                //profession-specific effects:
                //note that as the level difference between the player and target becomes more positive, the greater the chance of the effect firing
                var profEffTrigger = (Math.random() * 100) < ((6.25 * Math.max(-6, Math.min($scope.lvl - $scope.$parent.intTarg.lvl, 6))) + 37.5);
                if (profEffTrigger) {
                    if ($scope.$parent.prof == 1) {
                        //war
                        if ($scope.monsStunned) {
                            //stunned: add degen.
                            if ($scope.comb.checkDoTDup($scope.currMDegens, $scope.$parent.intTarg.name + '-war-degen')) {
                                $scope.currMDegens.push(new $scope.comb.DoT($scope.$parent.intTarg.name + '-war-degen', 2, 5));
                            } else {
                                $scope.resetDoTDur('currMDegens', $scope.$parent.intTarg.name + '-war-degen', 5)
                            }

                        } else if ($scope.currMDegens.length) {
                            $scope.monsStunned = true;
                        }
                    } else if ($scope.$parent.prof == 2) {
                        //sorc
                        if (Math.random() > .5) {
                            //degen to mons
                            if ($scope.comb.checkDoTDup($scope.currMDegens, $scope.$parent.intTarg.name + '-sorc-degen')) {
                                $scope.currMDegens.push(new $scope.comb.DoT($scope.$parent.intTarg.name + '-sorc-degen', 2, 5));
                            } else {
                                $scope.resetDoTDur('currMDegens', $scope.$parent.intTarg.name + '-sorc-degen', 5)
                            }

                        } else {
                            //regen to player
                            if ($scope.comb.checkDoTDup($scope.currPRegens, $scope.$parent.intTarg.name + '-sorc-regen')) {
                                $scope.currPRegens.push(new $scope.comb.DoT($scope.$parent.intTarg.name + '-sorc-regen', 3, 5));
                            } else {
                                $scope.resetDoTDur('currPRegens', $scope.$parent.intTarg.name + '-sorc-regen', 5)
                            }

                        }
                    } else if ($scope.$parent.prof == 3) {
                        //paly
                        $scope.monsRetalled = true;
                    } else if ($scope.$parent.prof == 4) {
                        //necro: lifesteal (i.e., heal and increased dmg)
                        $scope.currHp += totalDmg * .15;
                        totalDmg *= 1.15;
                    } else if (aethEnSteal) {
                        //aeth: (steal energy)
                        if ($scope.$parent.intTarg.en && $scope.$parent.intTarg.en > 3) {
                            $scope.currEn += 3;
                            $scope.$parent.currEn = $scope.currEn;
                            $scope.$parent.intTarg.en -= 3;
                        }
                    }
                }
                //and finally, return the damage!
                return totalDmg;
            } else if ($scope.$parent.fullSkills[$scope.currSkillNum].energy > $scope.currEn) {
                sandalChest.alert('You don\'t have enough energy to use ' + $scope.$parent.fullSkills[$scope.currSkillNum].name + '.')
                return 0;
            } else {
                sandalChest.alert('You\'ve been stunned! You can\'t attack this turn.')
                return 0;
            }
        } else {
            //monster is attacking PLAYER
            //for now, i have not yet implemented player degen and monster regen, since monsters do not yet use skills
            if (!$scope.monsStunned) {
                dtype = $scope.$parent.intTarg.type;
                totalRawD = lvlDif * (Math.ceil(Math.random() * ($scope.$parent.intTarg.max - $scope.$parent.intTarg.min)) + $scope.$parent.intTarg.min);
                var parts = {
                    'head': {
                        freq: 1
                    },
                    'chest': {
                        freq: 5
                    },
                    'hands': {
                        freq: 3
                    },
                    'legs': {
                        freq: 2
                    },
                    'feet': {
                        freq: 1
                    }
                };
                //first, we pick a random part of the body to be 'hit'
                var partFreqs = $scope.comb.freqGen(parts);
                var thePart = partFreqs[Math.floor(Math.random() * partFreqs.length)];
                //which part was hit, and its armor. 
                var partHitA = 0;
                if ($scope.playerItems[thePart] && $scope.playerItems[thePart][1] && $scope.playerItems[thePart][1] > -1) {
                    //this piece exists, is armor, and haz a value.
                    partHitA = allArm[$scope.playerItems[thePart][1]].def;
                }
                //next, we sum up additional def from weapons
                var bonusA = 0;
                if (playerWeap[1].def) {
                    bonusA += playerWeap[1].def;
                }
                //then inventory items' resistance
                //Note that this only occurs for non-equippable items (i.e., NOT armor or weapons).
                //in other words, only rings/trinkets
                console.log('Now running inv item defense', $scope.playerItems.inv)
                if ($scope.playerItems.inv && $scope.playerItems.inv.length) {
                    //player has items in inv  
                    console.log('----Checking defense items:----')
                    for (var resd = 0; resd < $scope.playerItems.inv.length; resd++) {
                        if ($scope.playerItems.inv[resd].lootType == 0) {
                            console.log('CHECKING DEFENSE ON ITEM:', $scope.playerItems.inv[resd])
                            bonusA += $scope.playerItems.inv[resd].item[1].def || 0;
                        }
                        if ($scope.playerItems.inv[resd].item && $scope.playerItems.inv[resd].item[1] && $scope.playerItems.inv[resd].item[1].res && $scope.playerItems.inv[resd].item[1].res.indexOf(dtype) != -1) {
                            //the type of damage done by this monster IS being resisted by an item in inventory
                            activeRes = true;
                        }
                    }
                }
                //now we check res changes from items.
                totalRawA = partHitA + bonusA;
            } else {
                //mons was stunned last turn! do nothin, but set stunned status to false (so it can attack next turn)
                $scope.monsStunned = false;
            }
        }
        dmg = totalRawD / ((3 * Math.log10(totalRawA + 1)) || 1);
        if (activeRes) {
            dmg = dmg / 3;
        } else {
            if (playerWeap[0].defChanges[combatFac.getDmgType(dtype)] == 1 || playerWeap[2].defChanges[combatFac.getDmgType(dtype)] == 1) {
                //resistance from weapon mods. Divide output dmg by 3
                dmg /= 3;
            }
            if (playerWeap[0].defChanges[combatFac.getDmgType(dtype)] == -1 || playerWeap[2].defChanges[combatFac.getDmgType(dtype)] == -1) {
                //negative resistance (vulnerability) from weapon mods. mulyiply output dmg by 1.5
                dmg *= 1.5;
            }
        }
        if ($scope.$parent.prof == 1 || $scope.$parent.prof == 3) {
            //heavy armor dmg reduction
            console.log('Char has HEAVY ARMOR! Reduction in dmg');
            dmg *= 0.7;
        }
        if ($scope.pProt) {
            dmg *= 0.7;
            $scope.pProt = false;
        }
        return $scope.comb.fleeMult * dmg; //we return the total damage, multiplied by the flee multiplier (if any!).
    }
    $scope.comb.freqGen = function(obj) {
        //given an obj of objs, each with a frequency freq, generate an frequency array
        var els = Object.keys(obj),
            outArr = [];
        for (var i = 0; i < els.length; i++) {
            for (var j = 0; j < obj[els[i]].freq; j++) {
                outArr += els[i];
            }
        }
        return outArr;
    }
    $scope.comb.acceptStatus = function() {
        //essentially we're just making the resetting stuff asynchronous so the user has time to react and bask in their victory/wallow in their defeat
        var vic = $scope.comb.battleStatus.title == 'Victory!';
        $('.pre-battle').show(10);
        $scope.comb.battleStatus = {
            status: false,
            title: ' ',
            txt: ' ',
            url: './img/paper.jpg'
        };
        var newXp = 0;
        if (vic) {
            combatFac.rollLoot($scope.intTarg).then(function(items) {
                console.log('FROM ROLL LOOT', items)
                var iName = '';
                var lootObj = {};
                if (items.type == 'junk') {
                    iName = items.loot.name;
                    // $scope.playerItems.inv.push(items.loot.num);
                    lootObj.lootType = 2;
                    lootObj.num = items.num;
                    lootObj.item = items.loot;
                    $scope.playerItems.inv.push(lootObj);
                } else {
                    //not junk!
                    lootObj.lootType = items.type;
                    lootObj.num = items.num;
                    lootObj.item = [items.loot.pre, items.loot.base, items.loot.post];
                    iName = items.loot.pre.pre + ' ' + items.loot.base.name + ' ' + items.loot.post.post;
                    $scope.playerItems.inv.push(lootObj)
                }
                sandalchest.alert('After killing the ' + $scope.comb.lastDefeated + ', you gain ' + newXp + ' experience and recieve ' + iName + '!', function(r) {
                    newXp = 50 * $scope.intTarg.lvl / $scope.playerLvl || 1;
                    //clear cell
                    angular.element('body').scope().cells[angular.element('body').scope().cellNames.indexOf(angular.element('body').scope().playerCell)].has = null;
                    combatFac.addXp($scope.name, newXp, $scope.$parent.cells, $scope.$parent.playerCell).then(function(s) {
                        $scope.inCombat = false;
                        musFac.getMusic('general');
                        console.log('RESULT FROM XP ROUTE', s)
                        angular.element('body').scope().inCombat = false;
                        angular.element('body').scope().intTarg = false;
                        angular.element('body').scope().moveReady = true;
                        angular.element('body').scope().currHp = angular.element('body').scope().maxHp;
                        angular.element('body').scope().currEn = angular.element('body').scope().maxEn;
                        if (typeof s.data == 'object') {
                            //got new xp (most likely, user won a fight)
                            $scope.currXp = parseInt(s.data.xp);
                            $scope.playerLvl = parseInt(s.data.lvl);
                            $scope.$parent.currXp = parseInt(s.data.xp);
                            $scope.$parent.playerLvl = parseInt(s.data.lvl);
                        }
                        $scope.currHp = $scope.maxHp;
                        $scope.currEn = $scope.maxEn;
                        angular.element('body').scope().$apply();
                    });
                });
            });
        } else if ($scope.comb.battleStatus.title == 'Flee!') {
            console.log('player fled')
            musFac.getMusic('general');
            angular.element('body').scope().playerCell = angular.element('body').scope().oldCell; //player always flees to previous cell
            angular.element('body').scope().inCombat = false;
            angular.element('body').scope().intTarg = false;
            angular.element('body').scope().moveReady = true;
            angular.element('body').scope().intTarg.currHp = angular.element('body').scope().hp;
            angular.element('body').scope().currEn = angular.element('body').scope().maxEn;
            $scope.$parent.intTarg.currHp = $scope.$parent.intTarg.hp;
            angular.element('body').scope().$apply();
        } else {
            //defeat
            console.log('defeat condition')
            musFac.getMusic('general');
            angular.element('body').scope().playerCell = '0-0';
            angular.element('body').scope().inCombat = false;
            angular.element('body').scope().intTarg = false;
            angular.element('body').scope().moveReady = true;
            angular.element('body').scope().intTarg.currHp = angular.element('body').scope().hp;
            angular.element('body').scope().currEn = angular.element('body').scope().maxEn;
            $scope.$parent.intTarg.currHp = $scope.$parent.intTarg.hp;
            angular.element('body').scope().$apply();
        }

    }
    $scope.comb.battleEndMsgs = {
        win: ['Onward!', 'To victory!', 'Forward'],
        lose: ['Retry!', 'I\'ll be back!', 'Another time then...'],
        flee: ['I\'m not a coward!', 'I\'ll be back...', 'Another time then...', 'A close one!']
    }
    $scope.comb.dieP = function() {
        musFac.getMusic('defeat');
        $scope.comb.battleStatus = {
            status: true,
            title: 'Defeat!',
            txt: 'You\'ve been defeated!',
            url: './img/assets/Defeat.jpg',
            btn: $scope.comb.battleEndMsgs.lose[Math.floor(Math.random() * $scope.comb.battleEndMsgs.lose.length)]
        };
    }
    $scope.comb.dieM = function() {
        musFac.getMusic('victory');
        $scope.comb.battleStatus = {
            status: true,
            title: 'Victory!',
            txt: 'You are victorious! The ' + $scope.intTarg.name + ' lies defeated at your feet.',
            url: './img/assets/Victory.jpg',
            btn: $scope.comb.battleEndMsgs.win[Math.floor(Math.random() * $scope.comb.battleEndMsgs.win.length)]
        };
    }
    $scope.comb.flee = function() {
        console.log('flee worked!')
        $scope.comb.battleStatus = {
            status: true,
            title: 'Flee!',
            txt: 'You\'ve successfully fled the ' + $scope.intTarg.name + '.',
            url: './img/assets/flee.jpg',
            btn: $scope.comb.battleEndMsgs.flee[Math.floor(Math.random() * $scope.comb.battleEndMsgs.flee.length)]
        };
    }
    $scope.comb.updateDoTs = function() {
            var a, n;
            //player regens
            for (n = 0; n < $scope.currPRegens; n++) {
                $scope.currHp += $scope.currPRegens[n].amt;
                $scope.currPRegens[n].dur--;
                if (!$scope.currPRegens[n].dur) {
                    $scope.currPRegens.splice(n, 1);
                }
            }
            if ($scope.currHp > $scope.maxHp) {
                $scope.currHp = $scope.maxHp
            }
            //player degens
            for (n = 0; n < $scope.currPDegens; n++) {
                $scope.currHp -= $scope.currPDegens[n].amt;
                $scope.currPDegens[n].dur--;
                if (!$scope.currPDegens[n].dur) {
                    $scope.currPDegens.splice(n, 1);
                }
            }

            //mons regens
            for (n = 0; n < $scope.currMRegens; n++) {
                $scope.intTarg.currHp += $scope.currMRegens[n].amt;
                $scope.currMRegens[n].dur--;
                if (!$scope.currMRegens[n].dur) {
                    $scope.currMRegens.splice(n, 1);
                }
            }
            if ($scope.intTarg.currHp > $scope.intTarg.hp) {
                $scope.intTarg.currHp = $scope.intTarg.hp
            }
            //mons degens
            for (n = 0; n < $scope.currMDegens; n++) {
                $scope.intTarg.currHp += $scope.currMDegens[n].amt;
                $scope.currMDegens[n].dur--;
                if (!$scope.currMDegens[n].dur) {
                    $scope.currMDegens.splice(n, 1);
                }
            }
        }
        // console.log('player stats', $scope.lvl, $scope.playerItems, $scope.questList, $scope.doneQuest, $scope.maxHp, $scope.currHp, $scope.maxEn, $scope.currEn, $scope.isStunned)
    $scope.comb.monsTurn = function() {
        //eventually, the monster should be able to do other stuff (heal, wait, etc)
        console.log('monster taking turn!')
        if (!$scope.monsStunned && $scope.intTarg.en >= $scope.intTarg.enPerAttack) {
            var monDmg = parseInt($scope.comb.calcDmg()); //mon dmg? Oui oui!
            var confSelfDmg = Math.random() < 0.5 && $scope.monsConf;
            if ($scope.monsRetalled) {
                $scope.intTarg.currHp -= 0.15 * monDmg;
            }
            if (!confSelfDmg) {
                //NOTE: monsters that are confused (confSelfDmg==true) are NOT affected by aetherist's reflect skills
                if ($scope.reflStatus.amt) {
                    //aetherist' reflect 
                    if (!$scope.reflStatus.types.length) {
                        //tier 1 or 2 reflects, not dependent on damage type. 
                        $scope.intTarg.currHp -= $scope.reflStatus * monDmg / 100;
                    } else if ($scope.reflStatus.types.indexOf($scope.$parent.intTarg.type) > -1) {
                        $scope.intTarg.currHp -= $scope.reflStatus * monDmg / 100;
                    }
                }
                //blank the reflect stats, in case we used it this turn.
                $scope.reflStatus.amt = 0;
                $scope.reflStatus.types = [];
                if ($scope.intTarg.currHp / $scope.intTarg.hp > .5 && Math.random < $scope.intTarg.healCh) {
                    //monster heals. This is the chance that it heals ABOVE a 'low health' threshold
                    sandalchest.alert('The ' + $scope.intTarg.name + ' heals!', function() {
                        var healAmt = $scope.intTarg.hp * (.07 + Math.random() / 10); //may change this later, but for now, monster heals for a random % of its max health
                        $scope.intTarg.currHp += healAmt;
                        //and of course, reset currHp to below max hp if necessary
                        if ($scope.intTarg.currHp > $scope.intTarg.hp) {
                            $scope.intTarg.currHp = $scope.currHp
                        }
                        $scope.comb.playersTurn = true;
                        $scope.comb.fleeMult = 1;
                        $scope.monsRetalled = false;
                    });
                } else if (($scope.intTarg.currHp / $scope.intTarg.hp) > .5 && ((-18 / 5) * ($scope.intTarg.currHp / $scope.intTarg.hp) + 3 > Math.random())) {
                    //monster at low hp (<50%), so gets additional % chance to heal
                    sandalchest.alert('The ' + $scope.intTarg.name + ' heals!', function() {
                        var healAmt = $scope.intTarg.hp * (.07 + Math.random() / 10); //may change this later, but for now, monster heals for a random % of its max health
                        $scope.intTarg.currHp += healAmt;
                        //and of course, reset currHp to below max hp if necessary
                        if ($scope.intTarg.currHp > $scope.intTarg.hp) {
                            $scope.intTarg.currHp = $scope.currHp
                        }
                        $scope.comb.playersTurn = true;
                        $scope.comb.fleeMult = 1;
                        $scope.monsRetalled = false;
                    });
                } else {
                    if (Math.random() < $scope.$parent.intTarg.stunCh) {
                        $scope.pStunned = true;
                    }
                    $scope.currHp -= monDmg; //reduce player's health by amt
                    var retalNote = $scope.monsRetalled ? ' Your Redemption trait reflects some of the monster&rsquo;s damage!' : '';
                    sandalchest.alert($scope.$parent.intTarg.name + ' attacks for ' + monDmg + ' ' + combatFac.getDmgType($scope.$parent.intTarg.type) + '!' + retalNote, function() {
                        $scope.comb.updateDoTs();
                        if ($scope.currHp <= 0) {
                            //FATALITY! Monster wins!
                            $scope.comb.dieP();
                            $scope.monsRetalled = false;
                        } else if ($scope.intTarg.currHp <= 0) {
                            //Monster kills self from retal.
                            $scope.comb.dieM();
                            $scope.monsRetalled = false;
                        } else {
                            $scope.comb.playersTurn = true;
                            $scope.comb.fleeMult = 1;
                            $scope.currEn += 2;
                            if ($scope.currEn > $scope.maxEn) {
                                $scope.currEn = $scope.maxEn;
                            }
                            $scope.monsRetalled = false;
                        }
                    })
                }

            } else {
                //monster confused, dmgs self
                $scope.monsConf = false;
                $scope.intTarg.currHp -= monDmg; //monster confused, dmgs self
                sandalchest.alert($scope.$parent.intTarg.name + ' is confused, and attacks itself for ' + monDmg + ' ' + combatFac.getDmgType($scope.$parent.intTarg.type) + '!', function() {
                    $scope.comb.updateDoTs();
                    if ($scope.intTarg.currHp <= 0) {
                        //Monster kills self.
                        //Sad.
                        $scope.comb.dieM();
                    } else {
                        $scope.comb.playersTurn = true;
                        $scope.comb.fleeMult = 1;
                        $scope.currEn += 2;
                        if ($scope.currEn > $scope.maxEn) {
                            $scope.currEn = $scope.maxEn;
                        }
                    }
                })
            }
        } else if ($scope.intTarg.en < $scope.intTarg.enPerAttack) {
            sandalchest.alert($scope.$parent.intTarg.name + ' ran out of energy and cannot attack!', function() {
                $scope.comb.playersTurn = true;
                $scope.comb.fleeMult = 1;
            });
        } else {
            sandalchest.alert($scope.$parent.intTarg.name + ' is stunned this turn!', function() {
                $scope.comb.playersTurn = true;
                $scope.comb.fleeMult = 1;
            });
        }
    }
});

app.factory('econFac', function($http, $q) {
    var npcTypes = ['merch', 'ambient', 'quest']
    return {
        merchInv: function(invArr,id) {
            //get all item info from backend 
            return $http.get('/item/allItems/').then(function(d) {
                console.log('GETTING ITEM DATA:invArr', invArr, d)
                    //now parse the inventory data, and return the object of that merch's inv
                    //lootTypes: 0 = armor, 1 =weapon, 2 = junk... others?
                    //array types (not NOT necessarily == lootTypes): [0]armor, [1] weaps, [2]affixes, [3]junk
                invArr.forEach(function(it) {
                    if (it.lootType == 0 || it.lootType == 1 && it.item.length == 3) {
                        //weapon/armor with affixes
                        //first, we do the affixes.
                        for (var i = 0; i < d.data[2].length; i++) {
                            if (it.item[0] == d.data[2][i].num) {
                                //found the affix!
                                it.item[0] = angular.copy(d.data[2][i]);
                            }
                            if (it.item[2] == d.data[2][i].num) {
                                //found the affix!
                                it.item[2] = angular.copy(d.data[2][i]);
                            }
                        }
                        if (it.lootType == 0) {
                            //armor!
                            for (var i = 0; i < d.data[0].length; i++) {
                                if (it.item[1] == d.data[0][i].num) {
                                    //found the affix!
                                    it.item[1] = angular.copy(d.data[0][i]);
                                }
                            }
                        } else {
                            //weap!
                            for (var i = 0; i < d.data[1].length; i++) {
                                if (it.item[1] == d.data[1][i].num) {
                                    //found the affix!
                                    it.item[1] = angular.copy(d.data[1][i]);
                                }
                            }
                        }
                    } else {
                        //should NEVER be here, as merchants do not sell junk. only the highest quality mats. Amazing mats. The best mats. We're gonna make merchanting great again.
                        throw new Error('FOUND JUNK ' + JSON.stringify(it) + ' in inventory of merch!');
                    }
                })
                console.log('POPULATED MERCH INV',invArr)
                return {
                    inv: invArr,
                    id: id
                };
            })
        },
        getNpc: function(i) {
            return $http.get('/other/oneNpc/' + i).then(function(n) {
                return {
                    data: n.data.data,
                    id: n.data.i
                };
            })
        },
        getQuests: function(name, id, lvl) {
            var idArr = id.split('-')
            return $http.get('/quest/npcQ/' + idArr[0] + '/' + idArr[1] + '/' + lvl + '/' + name).then(function(q) {
                return q.data;
            })
        },
        acceptQuest: function(usr,qid){
            return $http.post('/quests/acceptQuest',{n:usr,qid:qid}).then(function(n){
                return n.data;
            });
        }
    };
});

app.factory('mazeFac', function($http) {
    var cell = function(id, cont) {
            this.id = id;
            this.x = id.split('-')[0];
            this.y = id.split('-')[1];
            this.east = true;
            this.west = true;
            this.north = true;
            this.south = true;
            this.visited = false; //this visited is used for maze construction, NOT the player!
            this.pViz = false; //has player visited this room?
            this.has = cont; //what this room has in it
        },
        cellNames = [],
        cellsDone = 0,
        cells = [],
        currCell = '',
        path = [],
        possRoomConts = ['loot', 'mons', 'npcs', 'jewl', ' ', 'exit', ' ', ' ', 'mons', 'mons'],
        backTrace = function() {
            var good = false;
            while (!good) {
                //move one cell back on our 'path'
                path.pop();
                if (!path.length) {
                    return false;
                }
                //set new cell to previous cell
                currCell = path[path.length - 1];
                var posDirs = ['n', 'e', 's', 'w'],
                    pos = cellNames.indexOf(currCell),
                    targDir; //'good' is the next target cell
                while (!good && posDirs.length) {
                    targDir = Math.floor(Math.random() * posDirs.length);
                    good = cells[pos].checkCell(posDirs[targDir]);
                    if (good == 'e' || good == 'v') {
                        //not a valid cell
                        good = false;
                        posDirs.splice(targDir, 1);
                    }
                }
            }
            return good;
        },
        popCells = function() {
            // is this ever called?
            cells.forEach(function(cel) {
                if (cel.has == 'mons') {
                    $http.get('/item/getRanMons/' + cel.id).then(function(res) {
                        cells[cellNames.indexOf(res.data.cell)].has = res.data.mons;
                    });
                }
            });
        };

    cell.prototype.dig = function(dir, newCell) {
        switch (dir) {
            case 'n':
                //digging north, so delete N walls of old cell and S walls of new cell!
                this.north = false;
                newCell.south = false;
                break;
            case 'e':
                //digging east, so delete E walls of old cell and W walls of new cell!
                this.east = false;
                newCell.west = false;
                break;
            case 's':
                //digging south, so delete S walls of old cell and N walls of new cell!
                this.south = false;
                newCell.north = false;
                break;
            default:
                //digging west, so delete W walls of old cell and E walls of new cell!
                this.west = false;
                newCell.east = false;
        }
    };
    cell.prototype.checkCell = function(dir) {
        var posArr = this.id.split('-'),
            x = parseInt(posArr[0]),
            y = parseInt(posArr[1]);
        switch (dir) {
            case 'n':
                y--;
                break;
            case 'e':
                x++;
                break;
            case 's':
                y++;
                break;
            default:
                x--;
        }
        var newCellName = (x + '-' + y);
        var pos = cellNames.indexOf(newCellName);
        if (pos == -1) {
            return 'e'; //no cell in that direction
        } else if (cells[pos].visited) {
            return 'v'; //already visited this cell;
        } else {
            return newCellName; //new cell!
        }
    };

    return {
        popCell: function(l,c) {
            return $http.get('/item/beastie/' + l + '/' + c).then(function(res) {
                return res.data;
            });
        },
        makeMaze: function(mW, mH) {
            //reset
            cells = [];
            cellNames = [];
            path = [];
            cellsDone = 0
            var didEx = false;
            for (var x = 0; x < mW; x++) {
                for (var y = 0; y < mH; y++) {
                    var rItem = possRoomConts[Math.floor(Math.random() * possRoomConts.length)];
                    while ((x === 0 || y === 0) && rItem == 'exit') {
                        //entrance and top row and left column cannot be exit
                        rItem = possRoomConts[Math.floor(Math.random() * possRoomConts.length)];
                    }
                    if (rItem == 'exit') {
                        //only one exit!
                        didEx = true;
                        possRoomConts.splice(5, 1);
                    }
                    cells.push(new cell(x + '-' + y, rItem));
                    cellNames.push(x + '-' + y);
                }
            }
            if (!didEx) {
                cells[Math.floor(Math.random() * cells.length)].has = 'exit';
            }
            //we need to make sure we have at least one exit!

            //now have all cells, each with 4 walls set to true (on).
            //we start at cell 0-0 (top left)
            currCell = '0-0';
            while (cellsDone < cellNames.length) {
                path.push(currCell);
                var posDirs = ['n', 'e', 's', 'w'],
                    pos = cellNames.indexOf(currCell),
                    good = false,
                    targDir; //'good' is the next target cell
                while (!good && posDirs.length) {
                    targDir = Math.floor(Math.random() * posDirs.length);
                    good = cells[pos].checkCell(posDirs[targDir]);
                    if (good == 'e' || good == 'v') {
                        //not a valid cell
                        good = false;
                        posDirs.splice(targDir, 1);
                    }
                }
                cells[pos].visited = true; //mark this cell as visited
                if (!good) {
                    good = backTrace();
                }
                if (!good) {
                    break;
                }
                //found a new cell, so move forward
                var oldCell = currCell; //note that this might be modified by backtrace
                currCell = good;
                //and dig a hole!
                var newPos = cellNames.indexOf(currCell);
                cells[pos].dig(posDirs[targDir], cells[newPos]);
                cellsDone++;
            }
            return {
                cells: cells,
                names: cellNames,
                path: path
            };
        }
    };
});

app.controller('merch-cont', function($scope, $http, $q, $timeout, $window, econFac, UIFac) {
    //merchants!
    $scope.merchy.prepNpc = function() {
        $scope.merchy.buy = true;
        $scope.merchy.merch = $scope.currNpc;
        $scope.merchy.merch.sez = $scope.merchy.merch.gossip[Math.floor(Math.random() * $scope.merchy.merch.gossip.length)];
    };
    $scope.merchy.itemForPlayer = null;
    $scope.acceptQuest= function(){
        sandalchest.confirm('Accept Quest', 'Are you sure you want to accept this quest?',function(resp){
            if(resp){
                econFac.acceptQuest($scope.user.$scope.merchy.merch.quest.id);
            }    
        })
    }
    $scope.merchy.exchange = function(item, dir, ind) {
        //main sell function
        $scope.moveReady = false;
        angular.element('body').scope().moveReady = false;
        console.log(item)
        var itemFull = item.item[0].pre + ' ' + item.item[1].name + 's ' + item.item[2].post;
        var itemBaseCost = Math.floor(item.item[1].cost * (10 + item.item[0].cost + item.item[2].cost)) / 10;
        console.log('ITEM DATA TO EXCHANGE', item, 'and dir:', dir)
        sandalchest.dialog((dir ? "Sell" : "Buy") + " Items", "How many " + itemFull + " do you want to " + (dir ? "sell" : "buy") + "?<hr/><input type=number value=1 min=1 max=" + item.num + " id='numExch'>", {
            buttons: [{
                text: (dir ? "Sell" : "Buy") + " Items",
                close: true,
                click: function() {
                    var numToExch = parseInt($('#numExch').val());
                    if (dir && dir != 'false') {
                        //for selling, we dont check player munneez.
                        if (numToExch < item.num) {
                            //there'll still be some left over;
                            $scope.playerItems.inv[ind].num -= numToExch;
                        } else {
                            $scope.playerItems.inv.splice(ind, 1);
                        }
                        $scope.playerItems.gold += itemBaseCost * numToExch * .9;
                    } else {
                        //buying
                        if (numToExch * itemBaseCost < $scope.playerItems.gold) {
                            if (numToExch < item.num) {
                                //there'll still be some left over;
                                $scope.merchy.merch.inv[ind].num -= numToExch;
                            } else {
                                $scope.merchy.merch.inv.splice(ind, 1);
                            }
                            var itLoc = -1;
                            for (var i = 0; i < $scope.playerItems.inv.length; i++) {
                                var compName = $scope.playerItems.inv[i].item[0].pre + ' ' + $scope.playerItems.inv[i].item[1].name + 's ' + $scope.playerItems.inv[i].item[2].post
                                if (itemFull == compName) {
                                    //this item already exists, so just increase quantity;
                                    itLoc = i;
                                }
                            }
                            if (itLoc != -1) {
                                $scope.playerItems.inv[itLoc].num += numToExch;
                            } else {
                                //item does not already exist;
                                var itemForPlayer;
                                $scope.merchy.itemForPlayer = angular.copy(item);
                                console.log('ITEM FOR PLAYER', $scope.merchy.itemForPlayer)
                                $scope.merchy.itemForPlayer.num = numToExch;
                                $scope.playerItems.inv.push($scope.merchy.itemForPlayer);
                            }
                            $scope.playerItems.gold -= itemBaseCost * numToExch;
                        } else {
                            sandalchest.alert('You don\'t have enough money to afford ' + numToExch + ' ' + itemFull + 's!')
                        }
                    }
                    UIFac.doPlayerInv($scope.playerItems, $scope.bodyBoxes).then(function(s) {
                        $scope.bodyBoxes = s;
                        $scope.currUIObjs = $scope.playerItems.inv;
                    });
                    angular.element('body').scope().moveReady = true;
                    $scope.moveReady = true;
                }
            }, {
                text: 'Cancel',
                close: true,
                click: function() {
                    //dont sell/buy
                    angular.element('body').scope().moveReady = true;
                    $scope.moveReady = true;
                }
            }]
        })

    };
});

app.factory('musFac', function($http) {
    var themes = {
        battle: [],
        defeat: [],
        victory: [],
        intro: [],
        general: []
    }
    return {
    	createMus:function(){
    		//done once each page load to generate the audiocontext
    		window.AudioContext = window.AudioContext || window.webkitAudioContext;
            window.context = new AudioContext();
            window.gain = context.createGain();
            gain.gain.value = 0.5;
    	},
        getMusic: function(mode) {
            //get a random musical selection from a particular category
            if (window.context && window.source){
            	window.source.stop();
            }
            function process(Data) {
                window.source = window.context.createBufferSource(); // Create Sound Source
                window.context.decodeAudioData(Data, function(buffer) {
                    window.source.buffer = buffer;
                    window.source.connect(gain);
                    window.gain.connect(context.destination);
                    window.source.start(context.currentTime);
                })
            }
            var request = new XMLHttpRequest();
            request.open("GET", "./other/mus/" + mode, true);
            request.responseType = "arraybuffer";
            request.onload = function() {
                var Data = request.response;
                process(Data);
            };
            request.send();
        },
        toggleMus: function(){
        	if (window.gain && window.gain.gain.value && window.gain.gain.value>0 ){
        		//mute
        		window.gain.gain.value=0;
        	}else if (window.gain && window.gain.gain.value==0 ){
        		window.gain.gain.value=.5;
        	}
        }
    }
})

var sandalchest = {};
sandalchest.drawDiv = function(e, n, t) {
    var a = e.options && e.options.speed || 1e3,
        o = e.options && e.options.rotation || 2,
        par = e.options && e.options.parent || 'body',
        s = document.createElement("div");
    s.id = "sandalchest-modal-bg", s.innerHTML = "&nbsp;";
    var l = document.createElement("div");
    l.className = "col-sm-12 col-md-4 col-md-offset-4 sandalchest-modal-main", l.innerHTML = "<h2>" + (e.title || " ") + '</h2><div class="sandalchest-text-main">' + (e.text || "") + "</div>", l.style.transform = "rotateZ(" + o + "deg)", $(s).append(l);
    var r = document.createElement("div"),
        u = document.createElement("div");
    r.className = "sandalchest-modal-scroll-top", u.className = "sandalchest-modal-scroll-bot", $(l).append(r), $(l).append(u);
    var i = document.createElement("div");
    i.className = "sandalchest-modal-scroll-right", $(r).append(i);
    var c = document.createElement("div");
    c.className = "sandalchest-modal-scroll-right", $(u).append(c);
    var m = document.createElement("div");
    m.className = "sandalchest-modal-scroll-left", $(r).append(m);
    var d = document.createElement("div");
    d.className = "sandalchest-modal-scroll-left", $(u).append(d), $(par).append(s), $(s).fadeIn(250), $(l).animate({ height: "80vh", top: "10vh" }, { duration: a, queue: !1 }), $(r).animate({ height: "0%" }, { duration: a, queue: !1 }), $(u).animate({ height: "0%" }, { duration: a, queue: !1 }), $(".sandalchest-modal-scroll-right").animate({ width: ".25%" }, { duration: a, queue: !1 }), $(".sandalchest-modal-scroll-left").animate({ width: ".25%" }, { duration: a, queue: !1 });
    var p = document.createElement("div");
    if (p.className = "sandalchest-modal-buttons", $(l).append(p), 3 > n) {
        var f = document.createElement("button"),
            g = document.createElement("button"),
            h = document.createElement("input");
        f.className = "btn btn-stone", g.className = "btn btn-stone", f.id = "sandalchest-okay", g.id = "sandalchest-nope", f.tabIndex = 0, g.tabIndex = 1, f.innerHTML = "Okay", g.innerHTML = "Cancel", h.id = "sandalchest-input";
        var y = null;
        $(p).append(f), 0 == n || ($(p).append(g), 1 == n || ($(".sandalchest-text-main").append("<br/><br/>").append(h), h.tabIndex = 0, f.tabIndex = 1, g.tabIndex = 2)), document.querySelector("#sandalchest-okay").onkeyup = function(e) { 27 == e.which && $("#sandalchest-nope").click() }, 2 > n ? document.querySelector("#sandalchest-okay").focus() : (document.querySelector("#sandalchest-input").focus(), document.querySelector("#sandalchest-input").onkeyup = function(e) { console.log(e), 27 == e.which ? $("#sandalchest-nope").click() : 13 == e.which && $("#sandalchest-okay").click() }), f.onclick = function() { $(s).fadeOut(250, function() { n > 1 ? y = $("#sandalchest-input").val() || !1 : 1 == n && (y = !0), t && t(y), $(this).remove() }) }, g.onclick = function() { $(s).fadeOut(250, function() { t && t(null), console.log(null), $(this).remove() }) } } else
        for (var b = 0; b < e.options.buttons.length; b++) {
            var v = document.createElement("button");
            v.className = "btn btn-stone", v.id = "customButton" + b, v.innerHTML = e.options.buttons[b].text || "Undefined", e.options.buttons[b].click && (console.log("Applying custom cb ", e.options.buttons[b].click), v.onclick = e.options.buttons[b].click), e.options.buttons[b].close && (v.onmouseup = function() { $(s).fadeOut(250, function() { $(this).remove() }) }), $(p).append(v) } }, sandalchest.alert = function(e, n, t, a) { console.log(arguments);
    for (var o = null, s = null, l = null, r = null, u = 0; u < arguments.length; u++) {
        if ("string" == typeof arguments[u] && null == o) o = arguments[u];
        else if ("string" == typeof arguments[u] && null == s) s = arguments[u];
        else if ("string" == typeof arguments[u]) throw new Error("Too many string params supplied!");
        if ("object" == typeof arguments[u] && null == l) l = arguments[u];
        else if ("object" == typeof arguments[u]) throw new Error("Too many configuration objects supplied!");
        if ("function" == typeof arguments[u] && null == r) r = arguments[u];
        else if ("function" == typeof arguments[u]) throw new Error("You can only have one callback function!") }
    var i = { title: o, text: s, options: l };
    sandalchest.drawDiv(i, 0, r) }, sandalchest.confirm = function(e, n, t, a) { console.log(arguments);
    for (var o = null, s = null, l = null, r = null, u = 0; u < arguments.length; u++) {
        if ("string" == typeof arguments[u] && null == o) o = arguments[u];
        else if ("string" == typeof arguments[u] && null == s) s = arguments[u];
        else if ("string" == typeof arguments[u]) throw new Error("Too many string params supplied!");
        if ("object" == typeof arguments[u] && null == l) l = arguments[u];
        else if ("object" == typeof arguments[u]) throw new Error("Too many configuration objects supplied!");
        if ("function" == typeof arguments[u] && null == r) r = arguments[u];
        else if ("function" == typeof arguments[u]) throw new Error("You can only have one callback function!") }
    var i = { title: o, text: s, options: l };
    sandalchest.drawDiv(i, 1, r) }, sandalchest.prompt = function(e, n, t, a) {
    for (var o = null, s = null, l = null, r = null, u = 0; u < arguments.length; u++) {
        if ("string" == typeof arguments[u] && null == o) o = arguments[u];
        else if ("string" == typeof arguments[u] && null == s) s = arguments[u];
        else if ("string" == typeof arguments[u]) throw new Error("Too many string params supplied!");
        if ("object" == typeof arguments[u] && null == l) l = arguments[u];
        else if ("object" == typeof arguments[u]) throw new Error("Too many configuration objects supplied!");
        if ("function" == typeof arguments[u] && null == r) r = arguments[u];
        else if ("function" == typeof arguments[u]) throw new Error("You can only have one callback function!") }
    var i = { title: o, text: s, options: l };
    sandalchest.drawDiv(i, 2, r) }, sandalchest.dialog = function(e, n, t, a) {
    for (var o = null, s = null, l = null, r = null, u = 0; u < arguments.length; u++) {
        if ("string" == typeof arguments[u] && null == o) o = arguments[u];
        else if ("string" == typeof arguments[u] && null == s) s = arguments[u];
        else if ("string" == typeof arguments[u]) throw new Error("Too many string params supplied!");
        if ("object" == typeof arguments[u] && null == l) l = arguments[u];
        else if ("object" == typeof arguments[u]) throw new Error("Too many configuration objects supplied!");
        if ("function" == typeof arguments[u] && null == r) r = arguments[u];
        else if ("function" == typeof arguments[u]) throw new Error("You can only have one callback function!") }
    if (!l || !l.buttons) throw new Error("Custom dialog specified without any buttons!");
    if (!o || !s) throw new Error("Custom dialogs MUST have both a title and body text!");
    var i = { title: o, text: s, options: l };
    sandalchest.drawDiv(i, 3, r) };

app.factory('socketFac', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () { 
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
app.factory('UIFac', function($http, $q, $location, $window, combatFac) {
    var findItem = function(arr, i) {
        for (var j = 0; j < arr.length; j++) {
            if (arr[j].num == i || arr[j].id == i) {
                return arr[j];
            }
        }
        return false;
    };
    var stSkill = function(p, data, owned) {
        this.data = data;
        this.p = p;
        this.owned = owned;
    }
    return {
        buySkill:function(data,usr){
            return $http.post('/user/buySkill/',{usr:usr,skill:data.id},function(r){
                return r.data;
            })
        },
        getUIObj: function(whichUI, UIStuff) {
            //get all the data
            var p = $http.get('/item/' + whichUI).then(function(res) {
                return res;
            });
            return p;
        },
        getAllUIs: function(info) {
            //function to get all of the items 
            return $http.get('/item/allUI').then(function(els) {
                //sort UI els
                //inventory, quests, beastiary (all), skills 
                var armor = null,
                    weap = null,
                    affix = null,
                    junk = null,
                    quest = null,
                    skill = null,
                    mon = null,
                    allSkill = [],
                    itemSlots = ['weap', 'feet', 'legs', 'head', 'hands', 'chest'];
                console.log(els.data);
                for (var i = 0; i < els.data.length; i++) {
                    //we use a distinguishing, unique feature of each 'type' of list to separate them into the above lists.
                    if (els.data[i][0].slot || els.data[i][0].slot === 0) {
                        //armor
                        armor = els.data[i];
                    } else if (els.data[i][0].post) {
                        //affixes
                        affix = els.data[i];
                    } else if (els.data[i][0].cost && els.data[i][0].min) {
                        //weap
                        weap = els.data[i];
                    } else if (els.data[i][0].cost && els.data[i][0].desc) {
                        //junk
                        junk = els.data[i];
                    } else if (els.data[i][0].stunCh || els.data[i][0].stunCh === 0) {
                        //mons
                        mon = els.data[i];
                    } else if (els.data[i][0].burst || els.data[i][0].burst === 0) {
                        //skill
                        skill = els.data[i];
                    } else {
                        quest = els.data[i];
                    }
                }
                console.log('armor:', armor[0], '\nAffix', affix[0], '\nJunk', junk[0], '\nWeap', weap[0], '\nMon', mon[0], '\nSkill', skill[0], '\nQuest', quest[0])
                    //now should have all the data in their proper places. now we need to 'populate' the appropriate fields in the given userdata ('info')
                info.inProg.forEach(function(qId) {
                    for (i = 0; i < quest.length; i++) {
                        if (qId == quest[i].id) {
                            qId = angular.copy(quest[i]);
                        }
                    }
                });
                info.done.forEach(function(qId) {
                    for (i = 0; i < quest.length; i++) {
                        if (qId == quest[i].id) {
                            qId = angular.copy(quest[i]);
                        }
                    }
                });
                //mon!
                info.mon = mon;
                console.log('RAW ITEMS DATA', info.items)
                    //now items!
                    //slots
                itemSlots.forEach(function(lbl) {
                    if ((info.items[lbl][1] || info.items[lbl][1] === 0) && info.items[lbl][1] != -1 && typeof info.items[lbl] == 'number') {
                        //contains a valid item
                        info.items[lbl][0] = findItem(affix, info.items[lbl][0])
                        info.items[lbl][2] = findItem(affix, info.items[lbl][2])
                        if (lbl != 'weap') {
                            //armor
                            info.items[lbl][1] = findItem(armor, info.items[lbl][1])
                        } else {
                            info.items[lbl][1] = findItem(weap, info.items[lbl][1])
                        }
                    }
                });
                //and inventory!
                info.items.inv.forEach(function(it) {
                    //first, we need to determine if this is a weapon, armor, or junk
                    if (it.lootType == 2 && it.item.length && it.item.length == 1 && typeof it.item[0] == 'number') {
                        //junk (array length of 1)
                        it.item[0] = findItem(junk, it.item[0]);
                    } else if ((it.lootType == 1 || it.lootType == 0) && it.item.length && it.item.length == 3 && typeof it.item[0] == 'number') {
                        //weap or armor
                        it.item[0] = findItem(affix, it.item[0]);
                        it.item[2] = findItem(affix, it.item[2]);
                        if (it.lootType == 0) {
                            //armor
                            it.item[1] = findItem(armor, it.item[1]);
                        } else {
                            //weap
                            it.item[1] = findItem(weap, it.item[1]);
                        }
                    } else {
                        //do nothing: invalid lootType or not defined
                    }
                });
                console.log('FINAL ITEMS:', info.items)
                    //now, skill chains
                    //these are used for the skill purchasing system, by displaying the currently owned skills as well as ones we will be able to eventually buy

                //example: 10 --> 15:
                //[{fireball,immolate}]
                var skillChains = [];
                for (var i = 0; i < skill.length; i++) {
                    console.log('looking at skill',skill[i].name,'to see if base')
                    if ((skill[i].prevSkill == -1) && info.skills.indexOf(skill[i].id) > -1) {
                        //base skill, owned
                        var newSkillChain = {
                            skills: [skill[i].id]
                        };
                        newSkillChain[skill[i].id] = new stSkill(0, skill[i], true)
                        skillChains.push(newSkillChain);
                    }
                }
                //we should now have the BASE of all chains. we need to construct the rest of the chains.
                var skillsLeft = true;
                while (skillsLeft) {
                    skillsLeft = false;
                    for (i = 0; i < skillChains.length; i++) {
                        for (var j = 0; j < skill.length; j++) {
                            //loop thru all skills
                            if (skillChains[i].skills.indexOf(skill[j].id) < 0 && skillChains[i][skill[j].prevSkill]) {
                                console.log('Found another skill!', skill[j])
                                    //this has not yet been recorded in this skill chain, and is a following skill to one we already own.
                                skillsLeft = true;
                                skillChains[i].skills.push(skill[j].id);
                                skillChains[i][skill[j].id] = new stSkill(skill[j].prevSkill, skill[j], info.skills.indexOf(skill[j].id) > -1);
                            }
                        }
                    }
                }
                var skillChainsFin = []
                for (var i = 0; i < skillChains.length; i++) {
                    var newFinCh = { skills: skillChains[i].skills, lvls: [] }
                    for (var j = 0; j < skillChains[i].skills.length; j++) {
                        if (newFinCh.lvls.indexOf(skillChains[i][skillChains[i].skills[j]].data.skillPts) < 0) {
                            //lvl not yet recorded
                            console.log('new lvl!', skillChains[i][skillChains[i].skills[j]].data.skillPts, 'skill num', skillChains[i].skills[j], 'chain', skillChains[i])
                            newFinCh.lvls.push(skillChains[i][skillChains[i].skills[j]].data.skillPts);
                            newFinCh[skillChains[i][skillChains[i].skills[j]].data.skillPts] = [skillChains[i][skillChains[i].skills[j]]]
                        } else {
                            newFinCh[skillChains[i][skillChains[i].skills[j]].data.skillPts].push(skillChains[i][skillChains[i].skills[j]])
                        }
                    }
                    skillChainsFin.push(newFinCh);
                }
                info.chains = skillChainsFin;
                console.log('finalChains', skillChainsFin)
                    //replace skills in playersSkills with the actual skill objs (instead of just the number)
                info.skillsReal = info.skills.map(function(sk) {
                    console.log('skill id', sk, findItem(skill, sk))
                    return findItem(skill, sk);
                })
                return (info);
            })
        },
        getUIBg: function(which) {
            var UIBgs = {
                Inventory: '../img/UI/inv.jpg',
                Skills: '',
                Bestiary: '',
                Quests: ''
            };
            return UIBgs[which];
        },
        moreInfo: function(el) {
            var dmgTypes = ['Physical', 'Fire', 'Ice', 'Poison', 'Dark', 'Holy'];
            var addStuff = '<ul class="moreInfList">';
            var hasPic = false;
            //first, determine which type of item it is. Each inv el type has certain fields unique to that type
            console.log(el, !!el.item, el.item);
            if (el.item && (el.item[1].slot || el.item[1].slot == 0)) {
                //armor
                var arType;
                switch (el.item[1].slot) {
                    case 0:
                        arType = 'head';
                        break;
                    case 1:
                        arType = 'torso';
                        break;
                    case 2:
                        arType = 'pants';
                        break;
                    case 3:
                        arType = 'hands';
                        break;
                    case 4:
                        arType = 'feet';
                        break;
                    default:
                        arType = 'accessory';
                }
                addStuff += '<li>Type:' + arType + '</li>';
                addStuff += '<li>Defense:' + el.item[1].def || 'None' + '</li>';
                addStuff += '<li>Cost:' + el.item[1].cost + ' coins</li>';
                addStuff += '<li>Level:' + el.item[1].itemLvl + '</li>';
                addStuff += '<li>Resistance:';
                var resists = [];
                var vulns = [];
                //base item resists
                for (var i = 0; i < el.item[1].res.length; i++) {
                    if (resists.indexOf(dmgTypes[el.item[1].res[i]]) == -1) resists.push(dmgTypes[el.item[1].res[i]]);
                }
                //prefix resists
                for (var n in el.item[0].defChanges) {
                    if (el.item[0].defChanges[n] == 1 && resists.indexOf(el.item[0].defChanges[n]) == -1) {
                        resists.push(el.item[0].defChanges[n]);
                    } else if (el.item[0].defChanges[n] == -1 && vuln.indexOf(el.item[0].defChanges[n]) == -1) {
                        vuln.push(el.item[0].defChanges[n]);
                    }
                }
                for (var n in el.item[2].defChanges) {
                    if (el.item[2].defChanges[n] == 1 && resists.indexOf(el.item[2].defChanges[n]) == -1) {
                        resists.push(el.item[2].defChanges[n]);
                    } else if (el.item[2].defChanges[n] == -1 && vuln.indexOf(el.item[2].defChanges[n]) == -1) {
                        vuln.push(el.item[2].defChanges[n]);
                    }
                }
                addStuff += (resists.length ? resists.join(', ') : 'none') + '</li>';
                addStuff += '<li>Vulnerabilities:' + (vulns.length ? vulns.join(', ') : 'none') + '</li>';;
            } else if (el.giver || el.giver === 0) {
                //quest
                $http.get('/item/getGiver/' + el.giver).then(function(res) {
                    console.log('results from quest-giver search', res.data[0]);
                    addStuff += '<li>Level:' + el.lvl + '</li>';
                    addStuff += '<li>Given by:' + res.data[0].Name + '</li>';
                    addStuff += '</ul>';
                    $('#moreInf').html(addStuff);
                    $('#moreInf').show(200);
                    $('div.modal-footer > button.btn.btn-info').html('Less info');
                })
            } else if (el.energy || el.energy === 0) {
                //skill
                hasPic=true;
                if ((el.burst && el.burst > 0)||(el.degen && el.degen>0)) {
                    addStuff += '<li>Damage Type:' + combatFac.getDmgType(el.type) + '</li>';
                }
                addStuff += '<li>Energy:' + el.energy + '</li>';
                addStuff += el.heal ? '<li>Heal (burst):' + el.heal + ' hp</li>' : '';
                addStuff += el.regen ? '<li>Heal (regeneration):' + el.regen + ' hp/turn</li>' : '';
                addStuff += el.burst ? '<li>Damage:' + el.burst + ' hp</li>' : '';
                addStuff += el.degen ? '<li>Degeneration:' + el.degen + ' hp/turn</li>' : '';
                addStuff += el.stuns ? '<li>Stuns</li>' : '';
            } else if (el.maxHp) {
                //user. Shouldn't be this one!
                addStuff += 'What are you doing? You broke the game!';
            } else if (el.item && !el.item[1].slot) {
                //weapon
                addStuff += el.item[1].max ? '<li>Damage:' + el.item[1].min + '-' + el.item[1].max + ' hp</li>' : '';
                addStuff += el.item[1].def ? '<li>Defense:' + el.item[1].def + '</li>' : '';
                addStuff += '<li>Level:' + el.item[1].itemLvl + '</li>';
                addStuff += '<li>Cost:' + el.item[1].cost + ' coins</li>';
            } else {
                //monster
                hasPic = true;
                addStuff += '<li>Level:' + el.lvl + '</li>';
                addStuff += '<li>Hp:' + el.hp + ' hp</li>';
                addStuff += '<li>Dmg:' + el.min + '-' + el.max + ' hp</li>';
                addStuff += '<li>Damage Type:' + combatFac.getDmgType(el.type) + '</li>';
                addStuff += '<li>Resistance:';
                if (el.res && el.res.length) {
                    addStuff += '<ul>';
                    for (var i = 0; i < el.res.length; i++) {
                        addStuff += '<li> ' + combatFac.getDmgType(el.res[i]) + ' </li>';
                    }
                    addStuff += '</ul>';
                } else {
                    addStuff += '<span> none </span></li>';
                }
            }
            if (!el.giver && el.giver != 0) {
                addStuff += '</ul>';
                $('#moreInf').html(addStuff);
                if (hasPic) {
                    $('#moreInf').css({
                        'background': 'linear-gradient(rgba(241,241,212,.4),rgba(241,241,212,.4)),url(' + el.imgUrl + ')',
                        'background-size': 'contain',
                        'background-repeat': 'no-repeat',
                        'background-position': 'right'
                    })
                }
                $('#moreInf').show(200);
                $('div.modal-footer > button.btn.btn-info').html('Less info');
            }

        },
        lessInf: function() {
            $('#moreInf').hide(200);
            $('div.modal-footer > button.btn.btn-info').html('More info');
        },
        saveGame: function(data, lo, rel) {
            //save game, w/ optional logout
            //first, we need to reset user data to ONLY have the item ids:
            for (var i = 0; i < data.equip.inv.length; i++) {
                console.log('ITEM:', data.equip.inv[i])
                if (!(data.equip.inv[i].item instanceof Array) && typeof data.equip.inv[i].item == 'object') {
                    //item is just a regular object (not array of objs), so
                    //probly a junk item:
                    data.equip.inv[i].item = [data.equip.inv[i].item.num];
                } else {
                    for (var j = 0; j < data.equip.inv[i].item.length; j++) {
                        data.equip.inv[i].item[j] = data.equip.inv[i].item[j].num;
                    }
                }
                console.log('Inventory reducified!:', JSON.stringify(data.equip.inv))
            }
            console.log('data to save:', data)
            $http.post('/user/save', data).then(function(res) {
                if (lo && res) {
                    $http.get('/user/logout').then(function(r) {
                        window.location.href = './login';
                    });
                } else if (rel && res) {
                    $window.location.reload();
                } else {
                    // sandalchest.alert('Saved!', 'Your game has been saved!')
                }
            });
        },
        logout: function(usr) {
            //log out, but dont save game (this effectively wipes all progress from last save)
            sandalchest.confirm("Logout", "<span id='resetWarn'>WARNING:</span> You will lose all progress since your last save! Are you sure you wanna stop playing and log out?", function(r) {
                if (r && r !== null) {
                    $http.get('/user/logout').then(function(lo) {
                        window.location.href = './login';
                    });
                }
            });
        },
        reset: function() {
            //this fn is gonna be somewhat dangerous, so let's make absolutely sure
            var addendOne = Math.floor(Math.random() * 50),
                addendTwo = Math.floor(Math.random() * 50);
            sandalchest.dialog("Reset Account", "<div id='resetWarn'>WARNING:</div> Resetting your account is a <i>permanent</i> move. <br/>If you still wish to reset your game account, enter your username and password below, and solve the math question below and click the appropriate button. Be aware that this decision <i>cannot</i> be reversed!<hr/>Username:<input type='text' id='rmun'><br/>Password:<input type='password' id='rmpw'><hr/>Math Check:<br/>" + addendOne + " + " + addendTwo + " = <input type='number' id='mathChk'> ", {
                buttons: [{
                    text: 'YES, reset.',
                    close: false,
                    click: function() {

                        if (parseInt($('#mathChk').val()) == (addendOne + addendTwo)) {
                            //math check is okay, so let's check the creds
                            credObj = {
                                name: $('#rmun').val(),
                                pass: $('#rmpw').val()
                            };
                            $http.post('/user/reset', credObj).then(function(resp) {
                                if (resp) {
                                    window.location.replace('./login');
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                        } else {
                            return false;
                        }
                    }
                }, {
                    text: 'NO, don\'t.',
                    close: true

                }]
            });

        },
        resetLevel: function() {
            sandalchest.confirm('Are you sure you wanna reset this level?', function(r) {
                if (r) {
                    $http.get('/resetLevel').then(function(r) {
                        $window.location.reload();
                    })
                }
            })
        },
        getRingObjs: function(rNum) {
            var objs;
            switch (rNum) {
                case 0:
                    //Inventory
                    objs = [{
                        name: 'head',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'chest',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'hands',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'legs',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'feet',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'ring',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }];
                    break;
                case 1:
                    //Skills (& combat?)
                    objs = [{
                        name: 'Change Skill',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Skill Info',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Attack',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Retreat',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Wait',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Player Status',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }];
                    break;
                case 2:
                    //Bestiary
                    objs = [{
                        name: 'Current Creature Info',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'All Creatures Info',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Search Creatures',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Vanquished Creatures',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Quest Creatures',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }];
                    break;
                case 3:
                    //Quests
                    objs = [{
                        name: 'Current Side Quests',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Legendary Quests',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Old Quests',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Main Quests',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Quest Stats',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }];
                    break;
                default:
                    //Main Menu
                    objs = [{
                        name: 'Save',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Save and Logout',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Logout without saving',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Reset Account',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'Stats',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }, {
                        name: 'About',
                        imgUrl: '',
                        fn: function() {
                            console.log('clicked this!');
                        }
                    }]

            }
            var ringData = {
                objs: objs,
                rot: 360 / objs.length
            }
            console.log('ring data', ringData)
            return ringData;
        },
        PlatinumSpinningRings: function(curr, inc) {
            return curr + inc;
        },
        doPlayerInv: function(stuff, boxes) {
            return $http.get('/item/allItems').then(function(itArr) {
                for (var itm in stuff) {
                    if (itm != 'gold' && itm != 'inv') {
                        var fnd = -1;
                        //find which box this belongs to
                        for (var i = 0; i < boxes.length; i++) {
                            if (boxes[i].name == itm) {
                                fnd = i;
                                break;
                            }
                        }
                        if (stuff[itm].indexOf(-1) == -1) {
                            console.log('item isnt undefined!', stuff[itm]);
                            boxes[fnd].itName = itArr.data[2][stuff[itm][0]].pre + ' ' + (itm == 'weap' ? itArr.data[1][stuff[itm][1]].name : itArr.data[0][stuff[itm][1]].name) + ' ' + itArr.data[2][stuff[itm][2]].post;
                            boxes[fnd].itFullInfo = [itArr.data[2][stuff[itm][0]], itm == 'weap' ? itArr.data[1][stuff[itm][1]] : itArr.data[0][stuff[itm][1]], itArr.data[2][stuff[itm][2]]]
                        } else {
                            boxes[fnd].itName = 'none';
                        }
                    }
                }
                return boxes;
            })
        },
        getContMen: function(scp, x, y) {
            return {
                x: x,
                y: y,
                el: scp.UIEl,
                num: scp.$index
            }
        }
    };
});

app.factory('userFact', function($http) {
    return {
        checkPwdStr: function(pwd) {
            console.log('password:', pwd)
            var alphCap = new RegExp('[A-Z]', 'g');
            var alphLow = new RegExp('[a-z]', 'g');
            var nums = new RegExp('[0-9]', 'g');
            var weirds = new RegExp('\\W', 'g');
            var pwdStr = 0;
            if (pwd.search(alphCap) != -1) {
                pwdStr++;
            }
            if (pwd.search(alphLow) != -1) {
                pwdStr++;
            }
            if (pwd.search(nums) != -1) {
                pwdStr++;
            }
            if (pwd.search(weirds) != -1) {
                pwdStr++;
            }
            var len = pwd.length;
            if (len > 16) {
                pwdStr += 6
            } else if (len > 11) {
                pwdStr += 4;
            } else if (len > 6) {
                pwdStr += 2
            }
            return pwdStr;
        },
        checkPwdMatch: function(one, two) {
            if (one == two) {
                return true;
            }
            return false;
        },
        checkName: function(name) {
            console.log('NAME TO BACKEND', name)
                //note that below we're returning the ENTIRE http.get (the
                //asynchronous call). This allows us to use promisey things
                //like '.then()' on it in the controller.
            return $http.get('/user/nameOkay/' + name).then(function(nameRes) {
                console.log('NAME RESPONSE:', nameRes.data)
                if (nameRes.data == 'okay') {
                    return false
                } else {
                    return true;
                }
            })
        },
        login: function(creds) {
            console.log('credentials in factory', creds);
            return $http.post('/user/login', creds).then(function(logRes) {
                console.log('response from backend:', logRes)
                if (logRes.data == 'yes') {
                    return true;
                } else {
                    return false;
                }
            })
        },
        checkLogin: function() {
            return $http.get('/user/chkLog').then(function(chkLog) {
                console.log('CHECKLOG RESULTS', chkLog)
                return chkLog.data;
            })
        },
        getVoteExpl: function(inp) {
            console.log('Clicked', inp);
            var voteExplanations = {
                Name: 'Your armor, weapon or skill&rsquo;s Name.',
                Desc: 'Your armor, weapon or skill&rsquo;s Description.',
                Def: 'Some weapons provide defense!',
                DefArmor: 'How much this armor reduces damage.',
                Lvl: 'The armor, weapon or skill&rsquo;s level. This is roughly equivalent to a dungeon level!',
                Cost: 'How much your armor, weapon or skill costs in gold pieces',
                Min: 'Weapons do a random amount of damage between a minimum and maximum amount (not counting skill effects). This is the LOWER end of that range.',
                Max: 'Weapons do a random amount of damage between a minimum and maximum amount (not counting skill effects). This is the HIGHER end of that range.',
                Slot: 'Armor pieces fit on a particular slot: Head, Chest, Pants, Gloves, Boots, or None. Items in a "none" slot simply stay in inventory.',
                Res: 'Your armor can provide resistance against certain damage types.',
                Heavy: 'Armors are restricted by weight, so a necromancer and sorcerer can only wear LIGHT armor, while a paladin and warrior can only wear HEAVY armor.',
                Energy: 'How much energy your skill takes to cast.',
                Heal: 'Heal, or Burst Heal, is a one-time effect that restores a portion of your health on casting. Generally, Burst Heals are stronger than Regen heals per unit time, but they don&rsquo;t last as long. Compare with Regeneration.',
                Regen: 'Regen, or Regeneration, is a heal-over-time effect. Generally, regen heals are weaker per unit time than Burst Heals, but this is counteracted by their heal-over-time effect. Compare with Burst Heal.',
                Burst: 'Burst, Damage, or Burst Damage is pretty much what it sounds like: one walloping great smack of damage. It happens all at once tho, so if your enemy survives it, you will need to come up with a new plan.',
                Degen: 'Caused by effects like Burning, Bleeding, and Poison, Degeneration allows you to damage your foe a little bit over time. Great for adding a bit of pressure!',
                Type: 'The type of damage done by your skill. Be aware that certain enemies are resistant to certain damage types, so attacking a Flame Elemental with a fire-based attack may not be the best use of your time.',
                Prev: 'Except for the base skills - Bandage, Swing, Fireball, Chill, Curse, Smite, and Divine Blessing - every skill in the game has a "previous skill". In order to learn your skill, a player will need to have enough skill points AND own the previous skill.',
                ExtraFx: 'Certain skills have additional effects. For example, the warrior&rsquo;s Uppercut stuns.',
                Image: 'All skills require a skill icon!'
            }
            sandalchest.alert('Explanation', voteExplanations[inp])
        }
    };
});

app.controller('vote-con', function($scope, $http, userFact, $window) {
    userFact.checkLogin().then(function(resp) {
        if (!resp) {
            $window.location.href = './login';
        } else {
            $scope.user = resp; //should be username;
            refreshVotes();
        }
    });
    $scope.skillVotes = [];
    $scope.newSlots = [{
        lbl: '\uD83C\uDFA9 Head',
        num: 0
    }, {
        lbl: '\uD83D\uDC55 Chest',
        num: 1
    }, {
        lbl: '\uD83D\uDC56 Pants',
        num: 2
    }, {
        lbl: '\u261E Gloves',
        num: 3
    }, {
        lbl: '\uD83D\uDC62 Boots',
        num: 4
    }, {
        lbl: '\uD83D\uDC8D None',
        num: 5
    }];
    $scope.explVoteFld  = userFact.getVoteExpl;
    $scope.armorVotes = [];
    $scope.weapVotes = [];
    $scope.slots = ['\uD83C\uDFA9', '\uD83D\uDC55', '\uD83D\uDC56', '\u261E', '\uD83D\uDC62', '\uD83D\uDC8D']
    $scope.dtypes = ['Physical', 'Fire', 'Ice', 'Poison', 'Dark', 'Holy'];
    $scope.items = {
            armors: [],
            weaps: [],
            skills: []
        }
        //get initial list of votes
    $scope.sortCols = {
        weaps: 'num',
        skills: 'id',
        armors: 'num'
    }
    $scope.sortRev = {
        weaps: false,
        skills: false,
        armors: false
    }
    $scope.newItemCat = 'weap'; //meow
    $scope.chSort = function(col, tbl) {
        console.log('CHSORT', col, tbl, $scope.sortCols[tbl])
        if (col == $scope.sortCols[tbl]) {
            //reverse a row;
            $scope.sortRev[tbl] = !$scope.sortRev[tbl];
        } else {
            $scope.sortRev[tbl] = false;
            $scope.sortCols[tbl] = col;
        }
    }
    $scope.moveBar = function(s, e) {
        if (!s.voted) {
            s.voteCurr = 5 * e.offsetX / $(e.target).width();
            if (s.voteCurr > 5) {
                s.voteCurr = 5;
            }
        }
    }
    $scope.resetBar = function(s) {
        s.voteCurr = s.votes;
    }
    $scope.scrt=-40;
    $scope.scrollToDiv = function(id){
        console.log(id, $('#'+id).position().top);
        $(window).scrollTop($('#'+id).position().top);
    }
    window.onscroll=function(e){
        $scope.scrt = $(window).scrollTop()-40;
        $scope.$digest();
    }
    $scope.goGame = function(){
        sandalchest.confirm('Return to Game', 'Are you sure you want to stop voting and return to the game?',function(resp){
            if(resp){
                $window.location.href = './'
            }
        },{parent:'.vote-nav'})
    }
    $scope.newItemCat = 'weap';
    $scope.chVotePan = function(n){
        if(n == $scope.newItemCat){
            return false;
        }else{
            $('#'+$scope.newItemCat+'-vote').hide(200,function(){
                $scope.newItemCat = n;
                $('#'+$scope.newItemCat+'-vote').show(200);
                $scope.$digest();
            });
        }
    }
    var refreshVotes = function() {
        $http.get('./voting/voteList').then(function(v) {
            $scope.skillVotes = [];
            $scope.armorVotes = [];
            $scope.weapVotes = [];
            $scope.items = {
                armors: [],
                weaps: [],
                skills: []
            };
            console.log(v.data.votes)
                //votes
            v.data.votes.forEach(function(r) {
                if (r.type == 0) {
                    r.weap.votes = r.votes.reduce(function(a, b) {
                        return a + b;
                    }) / r.votes.length;
                    r.weap.voteCurr = r.weap.votes;
                    r.weap.vid = r.vid;
                    r.weap.voted = r.votedUsrs && r.votedUsrs.indexOf($scope.user) > -1;
                    $scope.weapVotes.push(r.weap);
                } else if (r.type == 1) {
                    r.armor.votes = r.votes.reduce(function(a, b) {
                        return a + b;
                    }) / r.votes.length;
                    r.armor.voteCurr = r.armor.votes;
                    r.armor.vid = r.vid;
                    r.armor.voted = r.votedUsrs && r.votedUsrs.indexOf($scope.user) > -1;
                    $scope.armorVotes.push(r.armor);
                } else if (r.type == 2) {
                    r.skill.votes = r.votes.reduce(function(a, b) {
                        return a + b;
                    }) / r.votes.length;
                    r.skill.voteCurr = r.skill.votes;
                    r.skill.vid = r.vid;
                    r.skill.voted = r.votedUsrs && r.votedUsrs.indexOf($scope.user) > -1;
                    $scope.skillVotes.push(r.skill);
                    console.log(r.skill)
                }
            });

            $scope.items.armors = v.data.armor;
            $scope.items.weaps = v.data.weaps;
            $scope.items.skills = v.data.skills;
            //construct fx list
            $scope.items.skills.forEach(function(sk) {
                sk.effectList = [];
                if (sk.stuns) {
                    sk.effectList.push('Stuns')
                }
                if (sk.extraFx.dmgVsStun) {
                    sk.effectList.push('Extra dmg vs. Stunned')
                }
                if (sk.extraFx.protection) {
                    sk.effectList.push('Adds Protection on next hit')
                }
                if (sk.extraFx.dmgVsDegen) {
                    sk.effectList.push('Extra dmg vs. Degenned Foes')
                }
                if (sk.extraFx.critChance) {
                    sk.effectList.push('Chance of critical hit')
                }
            });
            $scope.items.armors.forEach(function(ar) {
                ar.resList = [];
                ar.res.forEach(function(arRz) {
                    ar.resList.push($scope.dtypes[arRz]);
                })
            })
        });
    }
    $scope.concatRes = function(r){
        var resArr = [];
        $scope.dtypes.forEach(function(f,i){
            if (r[f]){
                resArr.push(i);
            }
        })
        return resArr;
    }
    $scope.doVote = function(s, e) {
            console.log('VID', s)
            var voStuff = {
                id: s.vid,
                val: 5 * e.offsetX / $(e.target).width(),
                usr: $scope.user
            }
            if (s.voted) {
                sandalchest.alert('Sorry, but you\'ve already voted for this item!',{parent:'.vote-nav'})
            } else {
                s.voted = true;
                console.log('user wants to vote ', s.voteCurr, 'for', s.name, 'voted', s.voted)
                $http.post('./voting/doVote', voStuff).then(function(r) {
                    console.log('RESPONSE FROM VOTES:', r)
                    refreshVotes();
                })
            }
        }
        //NOTE for the following: num (w & a) and id (s) is NOT defined! this is defined on the backend once the skill's voted in!
    $scope.subArmorVote = function() {
        var newVote = {
                type: 1
            },
            err = false;
        if (false) {
            //errs
        } else {
            newVote.armor = {
                name: $scope.newIt.name,
                desc: $scope.newIt.desc,
                cost: $scope.newIt.cost,
                def: $scope.newIt.def,
                slot: $scope.newIt.slot,
                res: $scope.concatRes($scope.newIt.res),
                itemLvl: $scope.newIt.itemLvl,
                heavy: $scope.newIt.heavy
            }
            newVote.vid = Math.floor(Math.random() * 99999).toString(32);
            newVote.votedUsrs = $scope.user;
            newVote.votes = [];
            newVote.votesOpen = true;
            newVote.user = $scope.user;
            $http.post('./voting/subVote',newVote).then(function(r){
                if(r.data!='done'){
                    sandalchest.alert('Too Many Submissions','Sorry, but you&rsquo;ve submitted too many items recently. Please wait for one of your items to expire before submitting another!')
                }else{
                    refreshVotes();
                }
            })
            console.log('NEW ARMOR:', newVote)
        }
    };
    $scope.subWeapVote = function() {
        var newVote = {
            type: 0
        }
        if (err) {
            //errs
        } else {
            newVote.weap = {
                name: $scope.newIt.name,
                desc: $scope.newIt.desc,
                cost: $scope.newIt.cost,
                def: $scope.newIt.def,
                itemLvl: $scope.newIt.itemLvl,
                min: $scope.newIt.min,
                max: $scope.newIt.max
            }
            newVote.vid = Math.floor(Math.random() * 99999).toString(32);
            newVote.votedUsrs = $scope.user;
            newVote.votes = [];
            newVote.votesOpen = true;
            $http.post('./voting/subVote',newVote).then(function(r){
                if(r.data!='done'){
                    sandalchest.alert('Too Many Submissions','Sorry, but you&rsquo;ve submitted too many items recently. Please wait for one of your items to expire before submitting another!')
                }else{
                    refreshVotes();
                }
            })
            console.log('NEW WEAPON:', newVote)
        }
    };
    $scope.newIt = {};
    $scope.subSkillVote = function() {
        //note that the name of this function is 'sub skill vote'. Not 'subs kill vote'. We have nothing against submarines taking part in the electoral process.
        var newVote = {
                type: 2
            }
            //check img dims
        console.log('imgData', $scope.icon);
        if (!$scope.icon.icon) {
            //no img err
            sandalchest.alert('Error', 'Skills require a skill icon! Please pick one.', function() {
                return false;
            },{parent:'.vote-nav'});
        } else if ($scope.icon.width > 170 || $scope.icon.height > 170) {
            //img too large err
            sandalchest.alert('Error', 'Your image is too large! Please use the bars to resize it, or considering picking a different image.', function() {
                return false;
            },{parent:'.vote-nav'});
        } else if ($scope.icon.width < 15 || $scope.icon.height < 15) {
            //img too smol err
            sandalchest.alert('Error', 'Your image is too small! What is this, an image for ants?', function() {
                return false;
            },{parent:'.vote-nav'});
        } else if ($scope.icon.width / $scope.icon.height > 2 || $scope.icon.width / $scope.icon.height < 0.5) {
            //img weird dims
            sandalchest.alert('Error', 'Your image has strange dimensions! Images should be approximately square', function() {
                return false;
            },{parent:'.vote-nav'});
        } else if (!$scope.newIt.name || !$scope.newIt.desc || (!$scope.newIt.energy && $scope.newIt.energy !== 0) || (!$scope.newIt.heal && !$scope.newIt.burst && !$scope.newIt.regen && !$scope.newIt.degen) || !$scope.newIt.type || !$scope.newIt.prevSkill) {

            //any other stuff not defined!
            sandalchest.alert('Error', 'One or more of your skill&rsquo;s parameters is undefined!', function() {
                return false;
            },{parent:'.vote-nav'});
        } else {
            newVote.skill = {
                name: $scope.newIt.name,
                desc: $scope.newIt.desc,
                energy: $scope.newIt.energy,
                heal: $scope.newIt.heal || 0,
                regen: $scope.newIt.regen || 0,
                burst: $scope.newIt.burst || 0,
                degen: $scope.newIt.degen || 0,
                type: $scope.dtypes.indexOf($scope.newIt.type) > -1 ? $scope.dtypes.indexOf($scope.newIt.type) : 0,
                prevSkill: $scope.newIt.prevSkill || 0,
                stuns: $scope.newIt.stuns,
                extraFx: $scope.newIt.extraFx,
                imgUrl: $scope.icon.icon
            }
            newVote.vid = Math.floor(Math.random() * 99999).toString(32);
            newVote.votedUsrs = $scope.user;
            newVote.votes = [];
            newVote.votesOpen = true;
            $http.post('./voting/subVote',newVote).then(function(r){
                if(r.data!='done'){
                    sandalchest.alert('Too Many Submissions','Sorry, but you&rsquo;ve submitted too many items recently. Please wait for one of your items to expire before submitting another!')
                }else{
                    refreshVotes();
                }
            });
            console.log('NEW SKILL:', newVote)
        }
    }
    $scope.sayIt = function() {
        console.log($scope.newIt)
    }
    $scope.canv = document.querySelector('canvas');
    $scope.ctx = $scope.canv.getContext("2d");
    $scope.icon = {
        width: 100,
        height: 100,
        maxWidth: 100,
        maxHeight: 100
    };
    $scope.getImage = function(e) {
        console.log(e);
        var reader = new FileReader();
        reader.onload = function(event) {
            var img = new Image();
            img.onload = function() {
                $scope.icon.width = img.width;
                $scope.icon.height = img.height;
                $scope.icon.maxWidth = img.width;
                $scope.icon.maxHeight = img.height;

                $scope.canv.style.width = img.width + 'px';
                $scope.canv.style.height = img.height + 'px';
                $scope.$digest();
                console.log($scope.icon.maxWidth, img.width, $scope.icon.maxHeight, img.height)
                $scope.ctx.drawImage(img, 0, 0);
                $scope.icon.width = img.width;
                $scope.icon.height = img.height;
                $scope.$digest();
                setTimeout(function() {
                    $scope.icon.width = img.width;
                    $scope.icon.height = img.height;
                    $scope.$digest();
                }, 1)
                $scope.icon.icon = $scope.canv.toDataURL();
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    };
    document.querySelector('#filepkr').addEventListener('change', $scope.getImage, false);
});
