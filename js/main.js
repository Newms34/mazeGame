var app = angular.module('mazeGame', []).controller('maze-con', function($scope) {
    $scope.width = 5;
    $scope.height = 5;
    $scope.path = []; //all the cells visited, in order.
    $scope.backtraceNum;
    $scope.currCell;
    $scope.bombsLeft = 5;
    $scope.cellsDone = 0;
    $scope.moveReady = false;
    $scope.cells = [];
    $scope.possRoomConts = ['\uD83D\uDCB0','\uD83D\uDC05','\uD83D\uDE4B','\uD83D\uDC8D',' ','\uD83D\uDC7E','\uD83D\uDEAA',' ',' ',' '];//things that could be in a room!
    $scope.cell = function(id,cont) {
        this.id = id;
        this.x = id.split('-')[0];
        this.y = id.split('-')[1];
        this.east = true;
        this.west = true;
        this.north = true;
        this.south = true;
        this.visited = false;//this visited is used for maze construction, NOT the player!
        this.pViz = false;//has player visited this room?
        this.has = cont;//what this room has in it
    };

    //set up maze initial position
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
        console.log('Moving ', dir, 'from', this.id, 'to', newCellName);
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
                var rItem = $scope.possRoomConts[Math.floor(Math.random()*$scope.possRoomConts.length)];
                $scope.cells.push(new $scope.cell(x + '-' + y,rItem));
                $scope.cellNames.push(x + '-' + y)
                if (rItem == '\uD83D\uDEAA'){
                  //only one exit!
                  $scope.possRoomConts.splice(6,1);
                }else if (rItem = '\uD83D\uDC7E'){
                  //only one boss!
                  $scope.possRoomConts.splice(5,1);
                }
            }
        }
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
                console.log('would go to:', good); //find us a new valid cell
                console.log('BACKTRACE! U DUN GOOFED! Path was:', $scope.path)

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
        console.log('END:', $scope.cellsDone, $scope.cells.length, $scope.cells)
        $scope.moveReady = true;
        $scope.playerCell = '0-0';
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
            console.log('movin back to', $scope.currCell)
            var posDirs = ['n', 'e', 's', 'w'],
                pos = $scope.cellNames.indexOf($scope.currCell),
                targDir; //'good' is the next target cell
            while (!good && posDirs.length) {
                targDir = Math.floor(Math.random() * posDirs.length);
                console.log('Attempting', pos, $scope.currCell)
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
    $scope.bombOn = false;
    $scope.prevDir = 0;
    $scope.movePlayer = function(dir){
      //this function effectively moves the player. In reality, it's actually moving everything else AROUND the player
      $scope.prevDir = dir;
    }
    $scope.roomRot=0;
    $scope.playerFacing = 0;
    window.onkeydown = function(e) {
        var currCell = $scope.cells[$scope.cellNames.indexOf($scope.playerCell)];
        var x = $scope.playerCell.split('-')[0];
        var y = $scope.playerCell.split('-')[1];
        var dir='north';
        if ($scope.playerFacing<45 || $scope.playerFacing>315){
          dir='north';
        }else if($scope.playerFacing>=45 && $scope.playerFacing<135){
          dir='west';
        }else if($scope.playerFacing>=225 && $scope.playerFacing<315){
          dir='east';
        }else{
          dir='south';
        }

        var isMoveKey = false;
        if (e.which==87||e.which==38){
          isMoveKey=true;
          var canMove = false;
          if (!currCell[dir]){
            canMove = true;
          }else if($scope.bombOn){
            canMove = true;
            $scope.bomb(dir);
            $scope.bombsLeft--;
          }
          if (canMove){
            switch(dir){
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
          console.log('Attempting to move',dir)
        }else if(e.which == 83 || e.which == 40){
          isMoveKey=true;
          var revDir;
          switch (dir){
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
          var canMove = false;
          if (!currCell[revDir]){
            canMove = true;
          }else if($scope.bombOn){
            canMove = true;
            $scope.bomb(revDir);
            $scope.bombsLeft--;
          }
          if (canMove){
            switch(revDir){
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
        }else if (e.which == 68 || e.which == 39) {
          //turn right
            console.log($scope.playerFacing,$scope.roomRot)
            isMoveKey = true;
            $scope.roomRot-=5;
            $scope.playerFacing = $scope.roomRot%360>0? $scope.roomRot%360:360+$scope.roomRot%360;
        } else if (e.which == 65 || e.which == 37) {
          //turn left
            console.log($scope.playerFacing,$scope.roomRot)
            isMoveKey = true;
            $scope.roomRot+=5;
            $scope.playerFacing = $scope.roomRot%360>0? $scope.roomRot%360:360+$scope.roomRot%360;
        } 
        else if (e.which == 66 && $scope.bombsLeft && !$scope.bombOn) {
            $scope.bombOn = true;
        } else if (e.which == 66 && $scope.bombOn) {
            $scope.bombOn = false;
        } else if (e.which == 82) {
            console.log('toggle rotation')
            $scope.rotOn = !$scope.rotOn;
        }
        if (isMoveKey) {
            e.preventDefault();
        }
        $scope.playerCell = x + '-' + y;
        $scope.cells[$scope.cellNames.indexOf($scope.playerCell)].pViz=true;
        $scope.$digest();
    }
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
    $scope.getWallStatus=function(dir){
      var roomWall = $scope.cells[$scope.cellNames.indexOf($scope.playerCell)][dir]?'./img/wall.jpg':'./img/door.jpg';
      return roomWall;
    }
    $scope.makeMaze();
});
