app.controller('comb-con', function($scope, $http, $q, $timeout, $window, combatFac) {
    //this is only in the subfolder because it's a subcomponent of the main controller (main.js)
    $scope.comb = {};
    $scope.comb.playersTurn = false; //monster goes first!
    $scope.comb.itemStats;
    $scope.comb.attackEffects = [];
    $scope.inCombat = true;
    $scope.comb.lastDefeated = null;
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
        combatFac.getItems().then(function(r) {
            $scope.comb.itemStats = r.data;
            $scope.currPRegens = [];
            $scope.currPDegens = [];
            $scope.currMRegens = [];
            $scope.currMDegens = [];
            $scope.popInv();
        });
    };
    $scope.comb.skillCh = function(dir) {
        if (dir) {
            if ($scope.currSkillNum < $scope.$parent.playerSkills.length - 1) {
                $scope.currSkillNum++;
            } else {
                $scope.currSkillNum = 0;
            }
        } else {
            if ($scope.currSkillNum > 0) {
                $scope.currSkillNum--;
            } else {
                $scope.currSkillNum = $scope.$parent.playerSkills.length - 1;
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
        combatFac.getSkillInf($scope.$parent.playerSkills, $scope.currSkillNum);
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
        var pDmg = parseInt($scope.comb.calcDmg(1));
        $scope.intTarg.currHp -= pDmg;
        combatFac.updateBars($scope.maxHp, $scope.currHp, $scope.maxEn, $scope.currEn, $scope.$parent.intTarg.hp, $scope.$parent.intTarg.currHp);
        $scope.comb.updateDoTs();
        var attackInfoStr = 'You attack for ' + pDmg + ' ' + combatFac.getDmgType($scope.$parent.playerSkills[$scope.currSkillNum].type) + ' damage, using ' + $scope.$parent.playerSkills[$scope.currSkillNum].name + '!';
        if ($scope.comb.attackEffects.length) {
            //add special effects!
            var novaHit = $scope.comb.attackEffects == 'nova';
            if (novaHit) $scope.comb.attackEffects.shift();
            var efStr = ' Your attack is a ';
            for (var i = 0; i < $scope.comb.attackEffects.length - 1; i++) {
                efStr += $scope.comb.attackEffects[i] + ', ';
            }
            efStr += $scope.comb.attackEffects.length > 1 ? 'and ' + $scope.comb.attackEffects[$scope.comb.attackEffects.length - 1] + ' one.' : $scope.comb.attackEffects[$scope.comb.attackEffects.length - 1] + ' one.';
            attackInfoStr += efStr;
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
    $scope.comb.calcDmg = function(d) {
        //first, get player items:

        var allWeaps = $scope.comb.itemStats[1],
            allArm = $scope.comb.itemStats[0],
            allAff = $scope.comb.itemStats[2],
            allJunk = $scope.comb.itemStats[3];
        console.log('WEAP IDS', $scope.$parent.playerItems.weap, 'WEAPS', allWeaps, 'ARMOR', allArm, 'AFFIXES', allAff, 'JUNK', allJunk)
        var playerWeap = $scope.$parent.playerItems.weap;
        console.log('PLAYER WEAPON:',playerWeap)
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
            if (!$scope.pStunned && $scope.$parent.playerSkills[$scope.currSkillNum].energy <= $scope.currEn) {
                //player is attacking monster, so we take the PLAYER'S dmg and the MONSTER'S armor
                dtype = $scope.$parent.playerSkills[$scope.currSkillNum].type;
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
                var skillDmg = $scope.$parent.playerSkills[$scope.currSkillNum].burst;
                console.log('ATTACKED USING A SKILL')
                console.log('SKILL WAS:', $scope.$parent.playerSkills[$scope.currSkillNum])
                    //for degen/regen, we basically wanna check to see if this particular degen (identified by monster name, skill name, and the -degen or -regen flag) is already in the list
                if ($scope.$parent.playerSkills[$scope.currSkillNum].degen) {
                    //add monster degen
                    var crueDur = Math.random() < playerWeap[0].crue || Math.random() < playerWeap[2].crue ? 10 : 5;
                    if (crueDur > 5) $scope.comb.attackEffects.push('cruel');
                    if ($scope.comb.checkDoTDup($scope.currMDegens, $scope.$parent.intTarg.name + '-' + $scope.$parent.playerSkills[$scope.currSkillNum].name + '-degen')) {
                        $scope.currMDegens.push(new $scope.comb.DoT($scope.$parent.intTarg.name + '-' + $scope.$parent.playerSkills[$scope.currSkillNum].name + '-degen', $scope.$parent.playerSkills[$scope.currSkillNum].degen, crueDur));
                    } else {
                        //this particular DoT is already in the list, so reset its duration to 5.
                        $scope.resetDoTDur('currMDegens', $scope.$parent.intTarg.name + '-' + $scope.$parent.playerSkills[$scope.currSkillNum].name + '-degen', crueDur)
                    }
                }
                if ($scope.$parent.playerSkills[$scope.currSkillNum].regen) {
                    //add player regen
                    var rejuvDur = Math.random() < playerWeap[0].rejuv || Math.random() < playerWeap[2].rejuv ? 10 : 5;
                    if (rejuvDur > 5) $scope.comb.attackEffects.push('rejuvenating');
                    if ($scope.comb.checkDoTDup($scope.currPRegens, 'player-' + $scope.$parent.playerSkills[$scope.currSkillNum].name + '-regen')) {
                        $scope.currPRegens.push(new $scope.comb.DoT('player-' + $scope.$parent.playerSkills[$scope.currSkillNum].name + '-regen', $scope.$parent.playerSkills[$scope.currSkillNum].regen, rejuvDur));
                    } else {
                        //this particular DoT is already in the list, so reset its duration to 5.
                        $scope.resetDoTDur('currPRegens', 'player-' + $scope.$parent.playerSkills[$scope.currSkillNum].name + '-regen', rejuvDur)
                    }
                }
                if ($scope.$parent.playerSkills[$scope.currSkillNum].heal) {
                    var beneMult = Math.random() < playerWeap[0].bene || Math.random() < playerWeap[2].bene ? 2 : 1;
                    if (rejuvDur > 5) $scope.comb.attackEffects.push('benedictive');
                    $scope.currHp += $scope.$parent.playerSkills[$scope.currSkillNum].heal * beneMult;
                    if ($scope.currHp > $scope.maxHp) {
                        $scope.currHp = $scope.maxHp
                    }
                }
                if ($scope.$parent.playerSkills[$scope.currSkillNum].stuns || Math.random() < playerWeap[0].stunCh || Math.random() < playerWeap[2].stunCh) {
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
                $scope.currEn -= $scope.$parent.playerSkills[$scope.currSkillNum].energy;
                return skillDmg + weapDmg + novaDmg;
            } else if ($scope.$parent.playerSkills[$scope.currSkillNum].energy > $scope.currEn) {
                sandalChest.alert('You don\'t have enough energy to use ' + $scope.$parent.playerSkills[$scope.currSkillNum].name + '.')
            } else {
                sandalChest.alert('You\'ve been stunned! You can\'t attack this turn.')
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
                dmg = dmg / 3
            }
            if (playerWeap[0].defChanges[combatFac.getDmgType(dtype)] == -1 || playerWeap[2].defChanges[combatFac.getDmgType(dtype)] == -1) {
                //negative resistance (vulnerability) from weapon mods. mulyiply output dmg by 1.5
                dmg = dmg * 1.5
            }
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
                newXp = 50 * $scope.intTarg.lvl / $scope.playerLvl||1;
                sandalchest.alert('After killing the ' + $scope.comb.lastDefeated + ', you gain ' + newXp + ' experience and recieve ' + iName + '!');

            });
            //clear cell
            angular.element('body').scope().cells[angular.element('body').scope().cellNames.indexOf(angular.element('body').scope().playerCell)].has = '';
        } else {
            //defeat
            angular.element('body').scope().playerCell = '0-0';
            angular.element('body').scope().intTarg.currHp = angular.element('body').scope().hp;
            $scope.$parent.intTarg.currHp = $scope.$parent.intTarg.hp;
        }
        combatFac.addXp($scope.name,newXp).then(function(s) {
            $scope.inCombat = false;
            angular.element('body').scope().inCombat = false;
            angular.element('body').scope().intTarg = false;
            angular.element('body').scope().moveReady = true;
            angular.element('body').scope().currHp = angular.element('body').scope().maxHp;
            angular.element('body').scope().currEn = angular.element('body').scope().maxEn;
            if(typeof s.data=='object'){
                //got new xp (most likely, user won a fight)
                $scope.currXp = 500-parseInt(s.data.xpTill);
                $scope.playerLvl = parseInt(s.data.lvl);
            }
            $scope.currHp = $scope.maxHp;
            $scope.currEn = $scope.maxEn;
            combatFac.updateBars($scope.maxHp, $scope.currHp, $scope.maxEn, $scope.currEn, $scope.$parent.intTarg.hp, $scope.$parent.intTarg.currHp);
            angular.element('body').scope().$apply();
        })
    }
    $scope.comb.battleEndMsgs = {
        win: ['Onward!', 'To victory!', 'Forward'],
        lose: ['Retry!', 'I\'ll be back!', 'Another time then...'],
        flee: ['I\'m not a coward!', 'I\'ll be back...', 'Another time then...', 'A close one!']
    }
    $scope.comb.dieP = function() {
        $scope.comb.battleStatus = {
            status: true,
            title: 'Defeat!',
            txt: 'You\'ve been defeated!',
            url: './img/assets/Defeat.jpg',
            btn: $scope.comb.battleEndMsgs.lose[Math.floor(Math.random() * $scope.comb.battleEndMsgs.lose.length)]
        };
    }
    $scope.comb.dieM = function() {
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

        //eventually, the monster should be able to do other stuff (heal, wait, etc)
        console.log('monster taking turn!')
        if (!$scope.monsStunned) {
            var monDmg = parseInt($scope.comb.calcDmg()); //mon dmg? Oui oui!
            var confSelfDmg = Math.random() < 0.5 && $scope.monsConf;
            if (!confSelfDmg) {
                /*first, effects:
                    Note that monster can neither heal nor stun if they're confused
        
                    */
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
                    })
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
                    })
                } else {
                    if (Math.random() < $scope.$parent.intTarg.stunCh) {
                        $scope.pStunned = true;
                    }
                    $scope.currHp -= monDmg; //reduce player's health by amt
                    combatFac.updateBars($scope.maxHp, $scope.currHp, $scope.maxEn, $scope.currEn, $scope.$parent.intTarg.hp, $scope.$parent.intTarg.currHp); //update health and energy bars
                    sandalchest.alert($scope.$parent.intTarg.name + ' attacks for ' + monDmg + ' ' + combatFac.getDmgType($scope.$parent.intTarg.type) + '!', function() {
                        $scope.comb.updateDoTs();
                        console.log('triggered cb for mons attack')
                        if ($scope.currHp <= 0) {
                            //FATALITY! Monster wins!
                            $scope.comb.dieP();
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

            } else {
                //monster confused, dmgs self
                $scope.monsConf = false;
                $scope.intTarg.currHp -= monDmg; //monster confused, dmgs self
                combatFac.updateBars($scope.maxHp, $scope.currHp, $scope.maxEn, $scope.currEn, $scope.$parent.intTarg.hp, $scope.$parent.intTarg.currHp); //update health and energy bars
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
        } else {
            sandalchest.alert($scope.$parent.intTarg.name + ' is stunned this turn!', function() {
                $scope.comb.playersTurn = true;
                $scope.comb.fleeMult = 1;
            });
        }
    }
});
