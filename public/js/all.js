var socket = io();
console.log('Socket', socket)
var app = angular.module('mazeGame', []).controller('maze-con', function($scope, $http, $q, $interval, $timeout, $window, combatFac, UIFac) {
    $scope.width = 6;
    $scope.height = 6;
    $scope.path = []; //all the cells visited, in order.
    $scope.backtraceNum;
    $scope.currCell;
    $scope.bombsLeft = 5;
    $scope.cellsDone = 0;
    $scope.moveReady = false;
    $scope.cells = [];
    $scope.invActive = false;
    $scope.setActive = false;
    $scope.intTarg;
    //for now, i'm setting the default contents of the player inv as below
    $scope.playerItems = [];
    $scope.possRoomConts = ['loot', 'mons', 'npcs', 'jewl', ' ', 'exit', ' ', ' ', 'mons', 'mons']; //things that could be in a room!
    $scope.uName = ''; //if this is blank, accept no incoming socket events from phone(s). Otherwise, accept from specified phone only!
    ($scope.checkPhone = function() {
        var isMobile = false; //initiate as false
        // device detection
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;
        if (isMobile) {
            $window.location.href = './mobile'
        }
    })();
    $scope.cell = function(id, cont) {
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
    };
    //set up maze initial position
    $scope.dmgType = combatFac.getDmgType;
    $scope.cell.prototype.dig = function(dir, newCell) {
        console.log('Digging in direction', dir, 'from old cell', this, 'to new cell', newCell);
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
        console.log('After excavation in direction', dir, 'from old cell', this, 'to new cell', newCell);
    }
    $scope.cell.prototype.checkCell = function(dir) {
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
        var newCellName = (x + '-' + y)
        var pos = $scope.cellNames.indexOf(newCellName)
        if (pos == -1) {
            return 'e'; //no cell in that direction
        } else if ($scope.cells[pos].visited) {
            return 'v'; //already visited this cell;
        } else {
            return newCellName; //new cell!
        }
    }
    $scope.cellNames = []; //makes cells easier to reference.
    $scope.makeMaze = function() {
        //reset
        $scope.cells = [];
        $scope.cellNames = [];
        $scope.path = [];
        $scope.cellsDone = 0;
        $scope.bombsLeft = 5;
        console.log('Generating maze of dimensions', $scope.width, ':', $scope.height)
        for (var x = 0; x < $scope.width; x++) {
            for (var y = 0; y < $scope.height; y++) {
                var rItem = $scope.possRoomConts[Math.floor(Math.random() * $scope.possRoomConts.length)];
                if (rItem == 'exit') {
                    console.log('room has exit')
                        //only one exit!
                    $scope.possRoomConts.splice(5, 1);
                }
                $scope.cells.push(new $scope.cell(x + '-' + y, rItem));
                $scope.cellNames.push(x + '-' + y);
            }
        }
        console.log('cells:', $scope.cells)
            //now have all cells, each with 4 walls set to true (on).
            //we start at cell 0-0 (top left)
        $scope.currCell = '0-0';
        while ($scope.cellsDone < $scope.cellNames.length) {
            $scope.path.push($scope.currCell)
            var posDirs = ['n', 'e', 's', 'w'],
                pos = $scope.cellNames.indexOf($scope.currCell),
                good = false,
                targDir; //'good' is the next target cell
            while (!good && posDirs.length) {
                targDir = Math.floor(Math.random() * posDirs.length);
                good = $scope.cells[pos].checkCell(posDirs[targDir]);
                if (good == 'e' || good == 'v') {
                    //not a valid cell
                    good = false;
                    posDirs.splice(targDir, 1);
                }
            }
            $scope.cells[pos].visited = true; //mark this cell as visited
            if (!good) {
                good = $scope.backTrace();
            }
            if (!good) {
                break;
            }
            //found a new cell, so move forward
            var oldCell = $scope.currCell; //note that this might be modified by backtrace

            $scope.currCell = good;
            //and dig a hole!
            var newPos = $scope.cellNames.indexOf($scope.currCell);
            $scope.cells[pos].dig(posDirs[targDir], $scope.cells[newPos]);
            console.log('Cell is now', $scope.currCell);
            $scope.cellsDone++;
        }
        $scope.moveReady = true;
        $scope.playerCell = '0-0';
        $scope.popCells();
    }
    $scope.popCells = function() {
        $scope.cells.forEach(function(cel) {
            if (cel.has == 'mons') {
                $http.get('/getRanMons/' + cel.id).then(function(res) {
                    console.log('This room contains an enemy:', res.data.mons)
                    $scope.cells[$scope.cellNames.indexOf(res.data.cell)].has = res.data.mons
                });
            }
        })
    }
    $scope.compareCell = function(id) {
        return id == $scope.playerCell;
    }
    $scope.backTrace = function() {
        var good = false;
        while (!good) {
            //move one cell back on our 'path'
            $scope.path.pop();
            if (!$scope.path.length) {
                return false;
            }
            //set new cell to previous cell
            $scope.currCell = $scope.path[$scope.path.length - 1];
            var posDirs = ['n', 'e', 's', 'w'],
                pos = $scope.cellNames.indexOf($scope.currCell),
                targDir; //'good' is the next target cell
            while (!good && posDirs.length) {
                targDir = Math.floor(Math.random() * posDirs.length);
                good = $scope.cells[pos].checkCell(posDirs[targDir]);

                if (good == 'e' || good == 'v') {
                    //not a valid cell
                    good = false;
                    posDirs.splice(targDir, 1);
                }
            }
        }
        return good;
    };
    //UI stuff
    //user's current UI
    $scope.Inventory = [];
    $scope.Skills = [];
    $scope.Bestiary = [];
    $scope.Quests = []

    $scope.currUINum = 0;
    $scope.UIPans = ['Inventory', 'Skills', 'Bestiary', 'Quests'];
    $scope.currUIObjs = []; //we get these from the factory
    $scope.currUIBg = '../img/UI/inv.jpg';
    $scope.currUIPan = $scope.UIPans[$scope.currUINum];
    $scope.chInv = function(dir) {
        //UI Cycle function
        console.log(dir, $scope.currUINum)
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
        // var currUIEls = UIFac.getUIObj($scope.currUIPan,$scope[$scope.currUIPan]);
        // console.log('UI stuff:',currUIEls)
        // $scope.currUIBg = currUIEls.bg;
        console.log(UIFac, UIFac.getUIObj)
        UIFac.getUIObj($scope.currUIPan, $scope[$scope.currUIPan]).then(function(uiRes) {
            $scope.currUIObjs = uiRes.data;
            console.log('UI OBJS:', $scope.currUIObjs)
        });
        $scope.currUIBg = UIFac.getUIBg($scope.currUIPan)
    };
    $scope.chInv(-1);
    //end UI stuff
    $scope.bombOn = false;
    $scope.roomRot = 0;
    $scope.playerFacing = 0;
    window.onkeydown = function(e) {
        if ($scope.moveReady) {
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
                console.log('Attempting to move', dir)
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
            } else if (e.which == 73) {
                console.log('i pressed and damage type 3 is', combatFac.getDmgType(3))
                $scope.invActive = !$scope.invActive;
            } else if (e.which == 192) {
                $scope.setActive = !$scope.setActive;
            }
            if (isMoveKey) {
                e.preventDefault();
            }
            $scope.playerCell = x + '-' + y;
            $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].pViz = true;
            console.log('CURRENT ROOM CONTENTS:', $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has)
            $scope.intTarg = typeof $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has == 'object' ? $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].has : false;
            $scope.$digest();
            if ((e.which == 87 || e.which == 38 || e.which == 83 || e.which == 40) && canMove && !$scope.moving) {
                $scope.moveAni(); //do Move animation
            }
        }
    }
    $scope.moving = false;
    $scope.moveAni = function() {
        $scope.moving = true;
        $('body').fadeOut(500, function() {
            $('body').fadeIn(500, function() {

                $scope.moving = false;
            })
        })
    }
    $scope.turnSpeed = 0;
    window.onmousemove = function(e) {
        $scope.$digest();
        var horiz = (e.x || e.clientX) / $(window).width();
        if (Math.abs(horiz - .5) > .3) {
            var lOrR = horiz > .5 ? -1 : 1;
            var turnVal = (Math.abs(horiz - .5) - .3) / .2;
            $scope.turnSpeed = lOrR * 6 * turnVal / 1.5;

        } else {
            $scope.turnSpeed = 0;
        }
    }
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
    }
    $scope.rotOn = true;
    $scope.vertRot = 85;
    $scope.getWallStatus = function(dir) {
        var roomWall = $scope.cells[$scope.cellNames.indexOf($scope.playerCell)][dir] ? './img/wall.jpg' : './img/door.jpg';
        return roomWall;
    }
    $scope.makeMaze();
    console.log('UI', document.querySelector('#uiloader'))
    $('#uiloader').draggable({ constrain: 'body' });
    $scope.inpPhone = function() {
        $scope.moveReady = false;
        bootbox.prompt("Enter a name (you get this by visiting the site on your phone)!", function(result) {
            if (result !== null && result != ' ') {
                //as long as its not blank
                socket.emit('chkName', { n: result })
            }
            $scope.moveReady = true;
        });
    }
    socket.on('chkNameRes', function(nm) {
        if (nm.n) {
            $scope.uName = nm.n;
        }
        console.log('Name:', nm.n)
    })
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
                $scope.phoneMovTimer = $timeout(function(){
                    $scope.travelOkay = true;
                },1000);
            } else if (mvOb.y == 'b' && $scope.travelOkay) {
                ey = new Event('keydown');
                ey.which = 83;
                window.onkeydown(ey);
                $scope.travelOkay = false;
                $scope.phoneMovTimer = $timeout(function(){
                    $scope.travelOkay = true;
                },1000);
            }
        }
    })
});

app.controller('mob-con', function($scope, $http, $q, $interval, $window) {
    $scope.currRotX = 0;
    $scope.currRotY = 0;
    $scope.rotX = 0;
    $scope.rotY = 0;
    $scope.uName = 'retrieving...'; //username!
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
                    console.log(noun, noun.indexOf(' '))
                }
                //got the noun. Now the adjective!
                console.log('final noun:', noun)
                $.ajax({
                    dataType: 'jsonp',
                    url: 'https://simple.wiktionary.org/w/api.php?action=query&list=categorymembers&format=json&cmsort=sortkey&cmstartsortkeyprefix=' + adjStart + '&cmlimit=500&cmtitle=Category:Adjectives',
                    success: function(adjRes) {
                        var adj = ' ';
                        while (adj.indexOf(' ') != -1) {
                            adj = adjRes.query.categorymembers[Math.floor(Math.random() * adjRes.query.categorymembers.length)].title;
                            console.log(adj, adj.indexOf(' '))
                        }
                        $scope.uName = adj + ' ' + noun;
                        $scope.$digest();
                    }
                })
            }
        })
    }
    $scope.sendMove = $interval(function() {
        if ($scope.uName != 'retrieving...' && $scope.isMoving) {
            //if we've registered a username and there is a movement to be submitted
            socket.emit('movData', $scope.movObj)
        }
    }, 75);
    $scope.isMoving = false;
    $scope.movObj = {};
    $window.onmousemove = function($event) {
        //i may eventually disable this for mobile use
        if ($scope.uName != 'retrieving...') {
            var rotX = Math.floor(200 * (($event.x / $(window).width()) - .5));
            var rotY = Math.floor(200 * (($event.y / $(window).height()) - .5));
            $scope.isMoving = false;
            //detect movement in x and y directions.
            if (rotX > 50) {
                $scope.rotX = 'r';
                $scope.isMoving = true;
            } else if (rotX < -50) {
                $scope.rotX = 'l'
                $scope.isMoving = true;
            }else{
                $scope.rotX = null;
            }
            if (rotY < -50) {
                $scope.rotY = 'f';
                $scope.isMoving = true;
            } else if (rotY > 50) {
                $scope.rotY = 'b';
                $scope.isMoving = true;
            }else{
                $scope.rotY = null;
            }
            $scope.movObj = {
                x: $scope.rotX,
                y: $scope.rotY,
                n: $scope.uName
            }
        }
    }
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
                $scope.rotX = 'l'
                $scope.isMoving = true;
            }else{
                $scope.rotX = null;
            }
            if (rotY < -35) {
                $scope.rotY = 'f';
                $scope.isMoving = true;
            } else if (rotY > 35) {
                $scope.rotY = 'b';
                $scope.isMoving = true;
            }else{
                $scope.rotY = null;
            }
            $scope.movObj = {
                x: $scope.rotX,
                y: $scope.rotY,
                n: $scope.uName
            }
        }
    });
    $scope.getUn();

});

app.factory('combatFac', function($http) {
	var dmgTypes = ['Physical','Fire','Ice','Poison','Dark','Holy'];
	return {
		getDmgType:function(typeNum){
			return dmgTypes[parseInt(typeNum)];
		}
	};
});
app.factory('mazeFac', function($http) {
    return {
        
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
app.factory('UIFac', function($http, $q) {
    return {
        getUIObj: function(whichUI, UIStuff) {
        	//get all the data
            var p = $http.get('/' + whichUI).success(function(res) {
                return res;
            });
            return p;
        },
        getUIBg: function(which){
        	var UIBgs = {
                Inventory: '../img/UI/inv.jpg',
                Skills: '',
                Bestiary: '',
                Quests: ''
            };
            return UIBgs[which];
        },
        sendUserUI:function(which){
        	var p = $http.get('/user/' + whichUI).success(function(res) {
                return res;
            });
            return p;
        }
    };
});
