var app = angular.module('mazeGame', []).controller('maze-con', function($scope, $http, $q, $interval, combatFac, UIFac) {
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
        if ($scope.rotOn) {
            //do we wanna just remove this?
            $scope.vertRot = (70 * (e.y || e.clientY) / $(window).height()) + 55;
        }
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
    console.log('UI',document.querySelector('#uiloader'))
    $('#uiloader').draggable({constrain:'body'});
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
