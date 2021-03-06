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
    $scope.mouseTurnTimer = $interval(()=>{
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
                socket.emit('chkName', { n: result,u:$scope.name });
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
                $scope.phoneMovTimer = $timeout(()=>{
                    $scope.travelOkay = true;
                }, 1000);
            } else if (mvOb.y == 'b' && $scope.travelOkay) {
                ey = new Event('keydown');
                ey.which = 83;
                window.onkeydown(ey);
                $scope.travelOkay = false;
                $scope.phoneMovTimer = $timeout(()=>{
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
