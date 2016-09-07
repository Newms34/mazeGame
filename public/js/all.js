var app = angular.module('mazeGame', ['ui.bootstrap.contextMenu','ngTouch']).controller('log-con', function($scope, $http, $q, $timeout, $window, userFact) {
    $scope.hazLogd = false;
    $scope.newUsr = function() {
        //eventually we need to CHECK to see if this user is already taken!
        //for now, we assume not
        if ($scope.regForm.pwd.$viewValue != $scope.regForm.pwdTwo.$viewValue) {
            bootbox.alert('Your passwords don&rsquo;t match!', function() {

            });
        } else {
            var userInf = {
                user: $scope.regForm.username.$viewValue,
                password: $scope.regForm.pwd.$viewValue
            };
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
                }else{
                    bootbox.alert('Either your username or password is not correct!')
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
                }else{
                    bootbox.alert('Either your username or password is not correct!');
                }
            });
        }
    };
    $scope.play = function() {
        $window.location.href = ('./');
    };
    $scope.passInf = function() {
        bootbox.alert('<h3>Password Strength</h3><hr/>Here are a few things to include for a stronger password:<ul><li>A lowercase letter</li><li>An uppercase letter</li><li>A number</li><li>A non alpha-numeric symbol (something like "@" or "$")</li></ul>Longer passwords are also generally better!');
    };
    $scope.upd = [];
    $scope.getNews=function(){
        $http.get('/other/news').then(function(res){
            $scope.upd = res.data.split(/[\n\r]/)
        })
    };
    $scope.getNews(); //REMOVE ME!
    $scope.parseInt = parseInt;//we're exposing this on the front end so that we can do stuff like <div>{{parseInt(someNum)}}</div>
});

var socket = io();
app.controller('maze-con', function($scope, $http, $q, $interval, $timeout, $window, mazeFac, combatFac, UIFac, userFact) {
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
    $scope.playerItems = [];
    $scope.questList = [];
    $scope.doneQuest = [];
    $scope.maxHp = 0;
    $scope.currHp = 0;
    $scope.maxEn = 0;
    $scope.currEn = 0;
    $scope.isStunned = false;
    $scope.possRoomConts = ['loot', 'mons', 'npcs', 'jewl', ' ', 'exit', ' ', ' ', 'mons', 'mons']; //things that could be in a room!
    $scope.name = ''; //actual name. 
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
        });
    };
    $scope.currSkillNum = 0;
    $scope.getUsrData();
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
    $scope.dmgType = combatFac.getDmgType;
    $scope.doMaze = function(w, h) {
        var mazeObj = mazeFac.makeMaze(w, h);
        $scope.cells = mazeObj.cells;
        $scope.path = mazeObj.path;
        $scope.cellNames = mazeObj.names;
        $scope.bombsLeft = 5;
        $scope.moveReady = true;
        $scope.playerCell = '0-0';
    }($scope.width, $scope.height);

    $scope.compareCell = function(id) {
        return id == $scope.playerCell;
    };
    $scope.Inventory = [];
    $scope.Skills = [];
    $scope.Bestiary = [];
    $scope.Quests = [];

    $scope.currUINum = 0;
    $scope.UIPans = ['Inventory', 'Skills', 'Bestiary', 'Quests', 'Menu'];
    $scope.currUIObjs = []; //we get these from the factory
    $scope.currUIBg = '../img/UI/inv.jpg';
    $scope.currUIPan = $scope.UIPans[$scope.currUINum];
    $scope.chInv = function(dir) {
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
        if ($scope.currUIPan !== 'Menu') {
            UIFac.getUIObj($scope.currUIPan, $scope[$scope.currUIPan]).then(function(uiRes) {
                $scope.currUIObjs = uiRes.data;
                console.log('UI OBJS:', $scope.currUIObjs);
            });
        }
        $scope.currUIBg = UIFac.getUIBg($scope.currUIPan);
    };
    $scope.chInv(-1);
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
                $scope.playerCell = x + '-' + y;
                $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].pViz = true;
                $scope.intTarg = typeof $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has == 'object' ? $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has : false;
                if ($scope.intTarg) {
                    console.log('cell cons (probly mons):', $scope.intTarg);
                    $scope.moveReady = false; //set to false since we're in combat!
                    combatFac.combatReady(); //set up the board
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
        $scope.moving = true;
        $('body').fadeOut(500, function() {
            $('body').fadeIn(500, function() {
                $scope.moving = false;
                if (ex && ex !== 0) {
                    $scope.lvl++;
                    console.log('new lvl!:', $scope.lvl);
                    $scope.saveGame(true);
                }
            });
        });
    };
    $scope.turnSpeed = 0;
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
    $scope.bomb = function(dir) {
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
    $scope.vertRot = 85;
    $scope.getWallStatus = function(dir) {
        var roomWall = $scope.cells[$scope.cellNames.indexOf($scope.playerCell)][dir] ? './img/wall.jpg' : './img/door.jpg';
        return roomWall;
    };
    $scope.isExit = function() {
        var tex = $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has == 'exit' ? './img/exit.png' : './img/ground.jpg';
        return tex;
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
        bootbox.prompt("Enter a name (you get this by visiting the site on your phone)!", function(result) {
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
        bootbox.dialog({
            title: '<h3>' + el.name + '</h3>',
            message: '<p>' + el.desc + '</p><p id="moreInf" style="display:none;"></p>',
            buttons: {
                success: {
                    label: "Close",
                    className: "btn-primary"
                },
                info: {
                    label: "More info",
                    className: "btn-info",
                    callback: function() {
                        if ($('#moreInf').css('display') == 'none') {
                            UIFac.moreInfo(el);
                        } else {
                            UIFac.lessInf();
                        }
                        return false;
                    }
                }
            }
        });
    };
    $scope.levelDown = function() {
        //TO DO: this needs to be dependent on quest statuses (i.e., certain quests block it). it also needs to send data back to Mongo to update what level the player's on.
        bootbox.confirm('Ready to go to the next level?', function(res) {
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
            isStunned: $scope.isStunned
        };
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
            isStunned: $scope.isStunned
        };
        UIFac.saveGame(data, true, false);
    };
    $scope.logout = UIFac.logout;
    $scope.reset = UIFac.reset;
    $scope.isNearMerch = false; //only active if we're in a room with a merchant
    $scope.invMenu = [
        ['Equip', function($itemScope) {
            console.log('RIGHT CLICK', $itemScope.UIEl);
        }], null, ['Destroy', function($itemScope) {
            console.log('RIGHT CLICK', $itemScope.UIEl);
            bootbox.confirm('Are you sure you wish to destroy this ' + $itemScope.UIEl.name + '?', function(res) {
                console.log('RES', res, $itemScope.UIEl.name);
                if (res && res !== null) {
                    var itToDest = -1;
                    for (var i = 0; i < $scope.currUIObjs.length; i++) {
                        if ($scope.currUIObjs[i].name == $itemScope.UIEl.name) {
                            itToDest = i;
                        }
                    }
                    if (itToDest != -1) {
                        console.log($scope.currUIObjs[itToDest])
                        $scope.currUIObjs.splice(itToDest, 1);
                        $scope.$digest();
                    }
                }
            });
        }], null, ['Sell', function($itemScope) {
            console.log('SELL', $itemScope)
        }, function($itemScope) {
            return $scope.isNearMerch;
        }]
    ]
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
            bootbox.dialog({
                message: all[n].desc,
                title: all[n].name,
                buttons: {
                    main: {
                        label: "Okay",
                        className: "btn-primary"
                    }
                }
            });
        },
        updateBars: function(pm, pc, pem, pec, mm, mc) {
            pm = parseInt(pm);
            pc = parseInt(pc);
            pem = parseInt(pem);
            pec = parseInt(pec);
            mm = parseInt(mm);
            mc = parseInt(mc);
            var phperc = parseInt(100 * pc / pm);
            var penperc = parseInt(100 * pec / pem);
            var mhperc = parseInt(100 * mc / mm);
            console.log(mhperc, phperc, penperc)
            $('#combat-box #enemy .health-bar .stat-bar-stat').css('width', mhperc + '%');
            $('#combat-box #player .health-bar .stat-bar-stat').css('width', phperc + '%');
            $('#combat-box #player .energy-bar .stat-bar-stat').css('width', penperc + '%');
        },
        getItems:function(){
            return $http.get('/item/allItems').then(function(s){
                return s;
            })
        },
        rollLoot:function(mons){
            return $http.get('/item/byLvl/'+mons.lvl).then(function(i){
                return i.data;
            })
        }
    };
});
app.controller('comb-con', function($scope, $http, $q, $timeout, $window, combatFac) {
    //this is only in the subfolder because it's a subcomponent of the main controller (main.js)
    $scope.comb = {};
    $scope.comb.skills;
    $scope.comb.playersTurn = false; //monster goes first!
    $scope.comb.itemStats;
    $scope.comb.attackEffects = [];
    $scope.comb.prepComb = function() {
        $scope.intTarg.currHp = $scope.intTarg.hp; //set ens current health to max. 
        //this is reset every time we 're-enter' the cell
        $('.pre-battle').hide(250);
        combatFac.getItems().then(function(r) {
            console.log(r)
            $scope.comb.itemStats = r.data;
            $scope.comb.monsTurn();
        });
    };
    $scope.comb.skillCh = function(dir) {
        if (dir) {
            if ($scope.currSkillNum < $scope.comb.skills.length - 1) {
                $scope.currSkillNum++;
            } else {
                $scope.currSkillNum = 0;
            }
        } else {
            if ($scope.currSkillNum > 0) {
                $scope.currSkillNum--;
            } else {
                $scope.currSkillNum = $scope.comb.skills.length - 1;
            }
        }
    }
    $scope.comb.getAllSkills = function() {
        $http.get('/item/Skills').then(function(s) {
            console.log(s.data)
            $scope.comb.skills = s.data;
        });
    }
    $scope.currPRegens = [];
    $scope.currPDegens = [];
    $scope.currMRegens = [];
    $scope.currMDegens = [];
    $scope.monsStunned = false;
    $scope.pStunned = false;
    $scope.comb.getAllSkills(); //we reload the skills each time, just in case there's been an update
    $scope.comb.showSkillInf = function() {
        combatFac.getSkillInf($scope.comb.skills, $scope.currSkillNum);
    }
    $scope.comb.attemptFlee = function() {
        //user attempting to run
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
        var pDmg = parseInt($scope.comb.calcDmg(1));
        $scope.intTarg.currHp -= pDmg;
        combatFac.updateBars($scope.maxHp, $scope.currHp, $scope.maxEn, $scope.currEn, $scope.$parent.intTarg.hp, $scope.$parent.intTarg.currHp);
        $scope.comb.updateDoTs();
        var attackInfoStr = 'You attack for ' + pDmg + ' ' + combatFac.getDmgType($scope.comb.skills[$scope.currSkillNum].type) + ' damage, using ' + $scope.comb.skills[$scope.currSkillNum].name + '!';
        if ($scope.comb.attackEffects.length){
            //add special effects!
            var novaHit = $scope.comb.attackEffects=='nova';
            if(novaHit) $scope.comb.attackEffects.shift();
            var efStr = ' Your attack is a ';
            for (var i=0;i<$scope.comb.attackEffects.length-1;i++){
                efStr+=$scope.comb.attackEffects[i]+', ';
            }
            efStr+=$scope.comb.attackEffects.length>1?'and '+$scope.comb.attackEffects[$scope.comb.attackEffects.length-1]+' one.':$scope.comb.attackEffects[$scope.comb.attackEffects.length-1]+' one.';
            attackInfoStr+=efStr;
        }
        bootbox.alert(attackInfoStr, function(r) {
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
    $scope.comb.calcDmg = function(d) {
        //first, get player items:

        var allWeaps = $scope.comb.itemStats[1],
            allArm = $scope.comb.itemStats[0],
            allAff = $scope.comb.itemStats[2];
        console.log('WEAP IDS', $scope.$parent.playerItems.weap, 'WEAPS', allWeaps, 'ARMOR', allArm, 'Affixes', allAff)
        var playerWeap = $scope.$parent.playerItems.weap[1] != -1 ? [allAff[$scope.$parent.playerItems.weap[0]], allWeaps[$scope.$parent.playerItems.weap[1]], allAff[$scope.$parent.playerItems.weap[2]]] : false;
        console.log(playerWeap[0].pre + ' ' + playerWeap[1].name + ' ' + playerWeap[2].post, playerWeap)
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
            if (!$scope.pStunned) {
                //player is attacking monster, so we take the PLAYER'S dmg and the MONSTER'S armor
                dtype = $scope.comb.skills[$scope.currSkillNum].type;
                //note that suffix mod dmg type takes precidence. SO a Firey axe of Ice will do COLD damge, not FIRE
                if (playerWeap[0].dmgType!=-1){
                    dtype = playerWeap[0].dmgType
                }
                if (playerWeap[2].dmgType!=-1){
                    dtype = playerWeap[2].dmgType
                }
                var weapDmg = playerWeap ? Math.floor(Math.random() * (playerWeap[1].max - playerWeap[1].min)) + playerWeap[1].min : 0;
                if (Math.random() < playerWeap[0].brut || Math.random() < playerWeap[2].brut) {
                    //check for 'brutal' modifier
                    weapDmg *= 1.7;
                    $scope.comb.attackEffects.push('brutal');
                }
                var skillDmg = $scope.comb.skills[$scope.currSkillNum].burst;
                //for degen/regen, we basically wanna check to see if this particular degen (identified by monster name, skill name, and the -degen or -regen flag) is already in the list
                if ($scope.comb.skills[$scope.currSkillNum].degen) {
                    //add monster degen
                    var crueDur = Math.random() < playerWeap[0].crue || Math.random() < playerWeap[2].crue ? 10 : 5;
                    if (crueDur>5) $scope.comb.attackEffects.push('cruel');
                    if ($scope.comb.checkDoTDup($scope.currMDegens, $scope.$parent.intTarg.name + '-' + $scope.comb.skills[$scope.currSkillNum].name + '-degen')) {
                        $scope.currMDegens.push(new $scope.comb.DoT($scope.$parent.intTarg.name + '-' + $scope.comb.skills[$scope.currSkillNum].name + '-degen', $scope.comb.skills[$scope.currSkillNum].degen, crueDur));
                    } else {
                        //this particular DoT is already in the list, so reset its duration to 5.
                        $scope.resetDoTDur('currMDegens', $scope.$parent.intTarg.name + '-' + $scope.comb.skills[$scope.currSkillNum].name + '-degen', crueDur)
                    }
                }
                if ($scope.comb.skills[$scope.currSkillNum].regen) {
                    //add player regen
                    var rejuvDur = Math.random() < playerWeap[0].rejuv || Math.random() < playerWeap[2].rejuv ? 10 : 5;
                    if (rejuvDur>5) $scope.comb.attackEffects.push('rejuvenating');
                    if ($scope.comb.checkDoTDup($scope.currPRegens, 'player-' + $scope.comb.skills[$scope.currSkillNum].name + '-regen')) {
                        $scope.currPRegens.push(new $scope.comb.DoT('player-' + $scope.comb.skills[$scope.currSkillNum].name + '-regen', $scope.comb.skills[$scope.currSkillNum].regen, rejuvDur));
                    } else {
                        //this particular DoT is already in the list, so reset its duration to 5.
                        $scope.resetDoTDur('currPRegens', 'player-' + $scope.comb.skills[$scope.currSkillNum].name + '-regen', rejuvDur)
                    }
                }
                if ($scope.comb.skills[$scope.currSkillNum].heal) {
                    var beneMult = Math.random() < playerWeap[0].bene || Math.random() < playerWeap[2].bene ? 2 : 1;
                    if (rejuvDur>5) $scope.comb.attackEffects.push('benedictive');
                    $scope.currHp += $scope.comb.skills[$scope.currSkillNum].heal * beneMult;
                    if ($scope.currHp > $scope.maxHp) {
                        $scope.currHp = $scope.maxHp
                    }
                }
                if ($scope.comb.skills[$scope.currSkillNum].stuns || Math.random() < playerWeap[0].stunCh || Math.random() < playerWeap[2].stunCh) {
                    $scope.monsStunned = true;
                    $scope.comb.attackEffects.push('stunning');
                }
                //calculate optional nova damage
                var novaDmg = Math.random() < playerWeap[0].novaChance || Math.random() < playerWeap[2].novaChance ? weapDmg * .5 : 0;
                if(novaDmg) $scope.comb.attackEffects.unshift('nova');
                //check for nova resistance
                if ($scope.intTarg.res.indexOf(playerWeap[0].novaType) != -1 || $scope.intTarg.res.indexOf(playerWeap[1].novaType) != -1) {
                    novaDmg = Math.floor(novaDmg / 3);
                }
                if (Math.random() < playerWeap[0].conf || Math.random() < playerWeap[2].conf) {
                    // Confusion: gives monster a 50% chance of damaging itSELF. 
                    $scope.monsConf = true;
                    $scope.comb.attackEffects.push('confusing')
                }
                if (playerWeap[0].vamp > 0 || playerWeap[2].vamp > 0) {
                    //vampiric: heal 5-15% weap dmg this strike
                    $scope.comb.attackEffects.push('life-stealing')
                    var vampPerc = (.1 * Math.random()) + .05; //percentage healed this strike;
                    $scope.currHp += (weapDmg + skillDmg) * vampPerc;
                    if ($scope.currHp > $scope.maxHp) {
                        $scope.currHp = $scope.maxHp
                    }
                }

                return skillDmg + weapDmg + novaDmg;
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
                var partHitA = $scope.playerItems[thePart] && $scope.playerItems[thePart][1].def != 0 ? $scope.playerItems[thePart][1].def : 0; //which part was hit
                //next, we sum up additional def from weapons
                var bonusA = 0;
                if (playerWeap[1].def) {
                    bonusA += playerWeap[1].def;
                }
                //then inventory items' def
                if ($scope.playerItems.inv && $scope.playerItems.inv.length) {
                    for (var resd = 0; resd < $scope.playerItems.inv.length; resd++) {
                        bonusA += $scope.playerItems.inv[resd][1].def || 0;
                        if ($scope.playerItems.inv[resd][1].res && $scope.playerItems.inv[resd][1].res.indexOf(dtype) != -1) {
                            //the type of damage done by this monster IS being resisted by an item in inventory
                            activeRes = true;
                        }
                    }
                }
                totalRawA = partHitA + bonusA;
                for (var p in parts) {
                    //check all armor pieces for resistance
                    if ($scope.playerItems[p].res && $scope.playerItems[p].res.indexOf(dtype) != -1) {
                        activeRes = true;
                    }
                }
            } else {
                //player was stunned last turn! do nothin, but set stunned status to false (so we can attack next turn)
                $scope.monsStunned = false;
            }
        }
        dmg = totalRawD / ((3 * Math.log10(totalRawA + 1)) || 1);
        if (activeRes) {
            dmg = dmg / 3;
        }else{
            if (playerWeap[0].defChanges[combatFac.getDmgType(dtype)]==1 || playerWeap[2].defChanges[combatFac.getDmgType(dtype)]==1){
                //resistance from weapon mods
                dmg = dmg/3
            }
            if (playerWeap[0].defChanges[combatFac.getDmgType(dtype)]==-1 || playerWeap[2].defChanges[combatFac.getDmgType(dtype)]==-1){
                //negative resistance (vulnerability) from weapon mods
                dmg = dmg*1.5
            }
        }
        return dmg;
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
    $scope.comb.dieP = function() {
        alert('U DED SON Q_Q');
        $('.pre-battle').show(10);
        angular.element('body').scope().moveReady = true;
        //reset player back to 'start' of maze. Eventually, I may include some other
        //penalties, such as losing a piece of armor, losing $, etc.
        angular.element('body').scope().playerCell = '0-0';
        angular.element('body').scope().currHp = angular.element('body').scope().maxHp;
        angular.element('body').scope().currEn = angular.element('body').scope().maxEn;
        $scope.currHp = $scope.maxHp;
        $scope.currEn = $scope.maxEn;
        angular.element('body').scope().intTarg.currHp = angular.element('body').scope().hp;
        $scope.$parent.intTarg.currHp = $scope.$parent.intTarg.hp;
        combatFac.updateBars($scope.maxHp, $scope.currHp, $scope.maxEn, $scope.currEn, $scope.$parent.intTarg.hp, $scope.$parent.intTarg.currHp);
        angular.element('body').scope().$apply();
    }
    $scope.comb.dieM = function() {
        alert('U WON SON :D');
        $('.pre-battle').show(10);
        combatFac.rollLoot($scope.intTarg).then(function(items){
            console.log('FROM ROLL LOOT',items)
            var iName='';
            if(items.type=='junk'){
                iName=items.loot.name;
                $scope.playerItems.inv.push(items.loot.num);
            }
            else{
                iName = items.loot.pre.pre+' '+items.loot.base.name+' '+items.loot.post.post;
                $scope.playerItems.inv.push([items.loot.pre.num,items.loot.base.num,items.loot.post.num])
            }
            bootbox.alert('After killing the '+$scope.intTarg.name+', you recieve '+iName+'!');

        });
        angular.element('body').scope().cells[angular.element('body').scope().cellNames.indexOf(angular.element('body').scope().playerCell)].has = '';
        angular.element('body').scope().intTarg = false;
        angular.element('body').scope().moveReady = true;
        angular.element('body').scope().currHp = angular.element('body').scope().maxHp;
        angular.element('body').scope().currEn = angular.element('body').scope().maxEn;
        $scope.currHp = $scope.maxHp;
        $scope.currEn = $scope.maxEn;
        combatFac.updateBars($scope.maxHp, $scope.currHp, $scope.maxEn, $scope.currEn, $scope.$parent.intTarg.hp, $scope.$parent.intTarg.currHp);
        angular.element('body').scope().$apply();
    }
    $scope.comb.updateDoTs = function() {
            var a;
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
        //for now, monster ALWAYS attacks
        //eventually, the monster should be able to do other stuff (heal, wait, etc)
        console.log('monster taking turn!')
        var monDmg = parseInt($scope.comb.calcDmg()); //mon dmg? Oui oui!
        var confSelfDmg = Math.random() < 0.5 && $scope.monsConf;
        if (!confSelfDmg) {
            $scope.currHp -= monDmg; //reduce player's health by amt
            combatFac.updateBars($scope.maxHp, $scope.currHp, $scope.maxEn, $scope.currEn, $scope.$parent.intTarg.hp, $scope.$parent.intTarg.currHp); //update health and energy bars
            bootbox.alert($scope.$parent.intTarg.name + ' attacks for ' + monDmg + ' ' + combatFac.getDmgType($scope.$parent.intTarg.type) + '!', function() {
                $scope.comb.updateDoTs();
                if ($scope.currHp <= 0) {
                    //FATALITY! Monster wins!
                    $scope.comb.dieP();
                } else {
                    $scope.comb.playersTurn = true;
                }
            })
        }else{
            $scope.monsConf=false;
            //monster confused, dmgs self
            $scope.intTarg.currHp -= monDmg; //monster confused, dmgs self
            combatFac.updateBars($scope.maxHp, $scope.currHp, $scope.maxEn, $scope.currEn, $scope.$parent.intTarg.hp, $scope.$parent.intTarg.currHp); //update health and energy bars
            bootbox.alert($scope.$parent.intTarg.name + ' is confused, and attacks itself for ' + monDmg + ' ' + combatFac.getDmgType($scope.$parent.intTarg.type) + '!', function() {
                $scope.comb.updateDoTs();
                if ($scope.intTarg.currHp <= 0) {
                    //Monster kills self
                    $scope.comb.dieM();
                } else {
                    $scope.comb.playersTurn = true;
                }
            })
        }
    }
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
        makeMaze: function(mW, mH) {
            //reset
            cells = [];
            cellNames = [];
            path = [];
            cellsDone = 0,
                didEx = false;
            for (var x = 0; x < mW; x++) {
                for (var y = 0; y < mH; y++) {
                    var rItem = possRoomConts[Math.floor(Math.random() * possRoomConts.length)];
                    while ((x===0 || y===0) && rItem=='exit'){
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
            popCells();
            return {
                cells: cells,
                names: cellNames,
                path: path
            };
        }
    };
});
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
    return {
        getUIObj: function(whichUI, UIStuff) {
            //get all the data
            var p = $http.get('/item/' + whichUI).success(function(res) {
                return res;
            });
            return p;
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
        // sendUserUI: function(which) {
        //     //note that we're actually returning a PROMISE here!
        //     var p = $http.get('/user/' + whichUI).success(function(res) {
        //         return res;
        //     });
        //     return p;
        // },
        moreInfo: function(el) {
            var addStuff = '<ul class="moreInfList">';
            //first, determine which type of item it is. Each inv el type has certain fields unique to that type
            console.log(el);
            if (el.slot || el.slot == 0) {
                //armor
                var arType;
                switch (el.slot) {
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
                addStuff += '<li>Defense:' + el.def + '</li>';
                addStuff += '<li>Cost:' + el.cost + ' coins</li>';
                addStuff += '<li>Level:' + el.itemLvl + '</li>';
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
                addStuff += '<li>Damage Type:' + combatFac.getDmgType(el.type) + '</li>';
                addStuff += '<li>Energy:' + el.energy + '</li>';
                addStuff += el.heal ? '<li>Heal (burst):' + el.heal + ' hp</li>' : '';
                addStuff += el.regen ? '<li>Heal (regeneration):' + el.regen + ' hp/turn</li>' : '';
                addStuff += el.burst ? '<li>Damage:' + el.burst + ' hp</li>' : '';
                addStuff += el.degen ? '<li>Degeneration:' + el.degen + ' hp/turn</li>' : '';
                addStuff += el.stuns ? '<li>Stuns</li>' : '';
            } else if (el.maxHp) {
                //user. Shouldn't be this one!
                addStuff += 'What are you doing? You broke the game!';
            } else if (el.itemLvl || el.itemLvl === 0) {
                //weapon
                addStuff += el.max ? '<li>Damage:' + el.min + '-' + el.max + ' hp</li>' : '';
                addStuff += el.def ? '<li>Defense:' + el.def + '</li>' : '';
                addStuff += '<li>Level:' + el.itemLvl + '</li>';
                addStuff += '<li>Cost:' + el.cost + ' coins</li>';
            } else {
                //monster
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
            $http.post('/user/save', data).then(function(res) {
                if (lo && res) {
                    $http.get('/logout').then(function(r) {
                        window.location.href = './login';
                    });
                } else if (rel && res) {
                    $window.location.reload();
                }
            });
        },
        logout: function(usr) {
            //log out, but dont save game (this effectively wipes all progress from last save)
            bootbox.confirm("<span id='resetWarn'>WARNING:</span> You will lose all progress since your last save! Are you sure you wanna stop playing and log out?", function(r) {
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
            bootbox.dialog({
                message: "<span id='resetWarn'>WARNING:</span> Resetting your account is a <i>permanent</i> move. <br/>If you still wish to reset your game account, enter your username and password below, and solve the math question below and click the appropriate button. Be aware that this decision <i>cannot</i> be reversed!<hr/>Username:<input type='text' id='rmun'><br/>Password:<input type='password' id='rmpw'><hr/>Math Check:<br/>" + addendOne + " + " + addendTwo + " = <input type='number' id='mathChk'> ",
                title: "Reset Account",
                buttons: {
                    danger: {
                        label: "YES, I would like to reset my account.",
                        className: "btn-danger",
                        callback: function() {

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
                    },
                    main: {
                        label: "NO, I do not wish to reset my account.",
                        className: "btn-primary",
                        callback: function() {
                            return true;
                        }
                    }
                }
            });
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
                rot : 360/objs.length 
            }
            console.log('ring data',ringData)
            return ringData;
        },
        PlatinumSpinningRings: function(curr, inc) {
            return curr + inc;
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
        checkName: function(name){
        	console.log('NAME TO BACKEND',name)
        	//note that below we're returning the ENTIRE http.get (the
        	//asynchronous call). This allows us to use promisey things
        	//like '.then()' on it in the controller.
        	return $http.get('/user/nameOkay/'+name).then(function(nameRes){
        		console.log('NAME RESPONSE:',nameRes.data)
        		if (nameRes.data=='okay'){
        			return false
        		}else{
        			return true;
        		}
        	})
        },
        login:function(creds){
        	console.log('credentials in factory',creds);
        	return $http.post('/user/login',creds).then(function(logRes){
        		console.log('response from backend:',logRes)
        		if (logRes.data=='yes'){
        			return true;
        		}else{
        			return false;
        		}
        	})
        },
        checkLogin: function(){
        	return $http.get('/user/chkLog').then(function(chkLog){
        		console.log('CHECKLOG RESULTS',chkLog)
        		return chkLog.data;
        	})
        }
    };
});