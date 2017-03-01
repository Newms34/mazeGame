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
            cellsDone = 0,
                didEx = false;
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
