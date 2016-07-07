app.controller('comb-con', function($scope, $http, $q, $timeout, $window, combatFac) {
    $scope.comb = {};
    $scope.comb.skills;
    $scope.comb.playersTurn = false; //monster goes first!
    $scope.comb.prepComb = function() {
        $scope.intTarg.currHp = $scope.intTarg.hp; //set ens current health to max. 
        //this is reset every time we 're-enter' the cell
        $('.pre-battle').hide(250);
        $scope.comb.monsTurn();
    }
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
        $http.get('/Skills').then(function(s) {
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
        var pDmg = parseInt($scope.comb.calcDmg(1));
        $scope.intTarg.currHp -= pDmg;
        combatFac.updateBars($scope.maxHp, $scope.currHp, $scope.maxEn, $scope.currEn, $scope.$parent.intTarg.hp, $scope.$parent.intTarg.currHp);
        $scope.comb.updateDoTs();
        bootbox.alert('You attack for ' + pDmg + ' ' + combatFac.getDmgType($scope.comb.skills[$scope.currSkillNum].type) + ' damage, using ' + $scope.comb.skills[$scope.currSkillNum].name + '!', function(r) {
            if ($scope.intTarg.currHp <= 0) {
                //FATALITY! Player wins!
                $scope.comb.dieM();
            } else {
                $scope.comb.playersTurn = false;
                $scope.comb.monsTurn();
            }
        })

    }
    $scope.comb.DoT = function(name, amt) {
        this.dur = 5;
        this.name = name;
        this.amt = amt;
    }
    $scope.comb.checkDoTDup = function(arr, name) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].name == name) {
                return false;
            }
        }
        return true;
    }
    $scope.resetDoTDur = function(arrName, name) {
        for (var i = 0; i < $scope[arrName].length; i++) {
            if ($scope[arrName][i].name == name) {
                $scope[arrName][i].dur = 5;
                break;
            }
        }
    }
    $scope.comb.calcDmg = function(d) {
        var dtype,
            totalRawD = 0,
            totalRawA = 0,
            activeRes = false,
            dmg,
            lvlDif;
        if ($scope.$parent.intTarg.lvl / $scope.lvl > 2) {
            lvlDif = 2;
        } else if ($scope.$parent.intTarg.lvl / $scope.lvl < .5) {
            lvlDif = .5;
        } else {
            lvlDif = $scope.$parent.intTarg.lvl / $scope.lvl;
        }
        //d=direction (to or from player). True = from player. False = to player
        if (d) {
            if (!$scope.pStunned) {
                //player is attacking monster, so we take the PLAYER'S dmg and the MONSTER'S armor
                dtype = $scope.comb.skills[$scope.currSkillNum].type;
                var weapDmg = $scope.playerItems['rHand'] ? Math.ceil(Math.random() * ($scope.playerItems['rHand'].max - $scope.playerItems['rHand'])) + $scope.playerItems['rHand'].min : 0;
                weapDmg += $scope.playerItems['lHand'] ? Math.ceil(Math.random() * ($scope.playerItems['lHand'].max - $scope.playerItems['lHand'])) + $scope.playerItems['lHand'].min : 0;
                var skillDmg = $scope.comb.skills[$scope.currSkillNum].burst;
                //for degen/regen, we basically wanna check to see if this particular degen (identified by monster name, skill name, and the -degen or -regen flag) is already in the list
                if ($scope.comb.skills[$scope.currSkillNum].degen) {
                    //add monster degen
                    if ($scope.comb.checkDoTDup($scope.currMDegens, $scope.$parent.intTarg.name + '-' + $scope.comb.skills[$scope.currSkillNum].name + '-degen')) {
                        $scope.currMDegens.push(new $scope.comb.DoT($scope.$parent.intTarg.name + '-' + $scope.comb.skills[$scope.currSkillNum].name + '-degen', $scope.comb.skills[$scope.currSkillNum].degen));
                    } else {
                        //this particular DoT is already in the list, so reset its duration to 5.
                        $scope.resetDoTDur('currMDegens', $scope.$parent.intTarg.name + '-' + $scope.comb.skills[$scope.currSkillNum].name + '-degen')
                    }
                }
                if ($scope.comb.skills[$scope.currSkillNum].regen) {
                    //add player regen
                    if ($scope.comb.checkDoTDup($scope.currPRegens, 'player-' + $scope.comb.skills[$scope.currSkillNum].name + '-regen')) {
                        $scope.currPRegens.push(new $scope.comb.DoT('player-' + $scope.comb.skills[$scope.currSkillNum].name + '-regen', $scope.comb.skills[$scope.currSkillNum].regen));
                    } else {
                        //this particular DoT is already in the list, so reset its duration to 5.
                        $scope.resetDoTDur('currPRegens', 'player-' + $scope.comb.skills[$scope.currSkillNum].name + '-regen')
                    }
                }
                if ($scope.comb.skills[$scope.currSkillNum].heal) {
                    $scope.currHp += $scope.comb.skills[$scope.currSkillNum].heal;
                    if ($scope.currHp > $scope.maxHp) {
                        $scope.currHp = $scope.maxHp
                    }
                }
                if ($scope.comb.skills[$scope.currSkillNum].stuns) {
                    $scope.monsStunned = true;
                }
                return skillDmg + weapDmg;
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
                var partHitA = $scope.playerItems[thePart] && $scope.playerItems[thePart] != 0 ? $scope.playerItems[thePart].def : 0; //which part was hit
                //next, we sum up additional def
                var bonusA = 0;
                if ($scope.playerItems.rHand && $scope.playerItems.rHand.def) {
                    bonusA += $scope.playerItems.rHand.def;
                }
                if ($scope.playerItems.lHand && $scope.playerItems.lHand.def) {
                    bonusA += $scope.playerItems.lHand.def;
                }
                //then, resistances (not futile) & inventory items' def
                if ($scope.playerItems.inv && $scope.playerItems.inv.length) {
                    for (var d = 0; d < $scope.playerItems.inv.length; d++) {
                        bonusA += $scope.playerItems.inv[d].def || 0;
                        if ($scope.playerItems.inv[d].res && $scope.playerItems.inv[d].res.indexOf(dtype) != -1) {
                            activeRes = true;
                        }
                    }
                }
                totalRawA = partHitA + bonusA;
                for (var p in parts) {
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
        // $scope.$parent.cells[$scope.$parent.cellNames.indexOf($scope.$parent.playerCell)].has = '';
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
    }
});
