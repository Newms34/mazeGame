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
                    for (i = 0; i < quests.length; i++) {
                        if (qId == quests[i].id) {
                            qId = angular.copy(quests[i]);
                        }
                    }
                });
                info.done.forEach(function(qId) {
                    for (i = 0; i < quests.length; i++) {
                        if (qId == quests[i].id) {
                            qId = angular.copy(quests[i]);
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
                    if ((!skill[i].prevSkill || skill[i].prevSkill == 0) && info.skills.indexOf(skill[i].id) > -1) {
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
                // if(data.equip.inv[i].item.length<2){
                //     console.log('JUNK!',data.equip.inv[i].item[0].num);

                // }else{
                //     if(typeof data.equip.inv[i].item[0]!=='number'){
                //         throw new Error('item '+JSON.stringify(data.equip.inv[i].item)+' isnt a number!')
                //     }
                // }
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
                    sandalchest.alert('Saved!', 'Your game has been saved!')
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
