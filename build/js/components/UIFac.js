app.factory('UIFac', function($http, $q, $location, $window, combatFac) {
    return {
        getUIObj: function(whichUI, UIStuff) {
            //get all the data
            var p = $http.get('/' + whichUI).success(function(res) {
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
        sendUserUI: function(which) {
            //note that we're actually returning a PROMISE here!
            var p = $http.get('/user/' + whichUI).success(function(res) {
                return res;
            });
            return p;
        },
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
                    addStuff += '<ul>'
                    for (var i = 0; i < el.res.length; i++) {
                        addStuff += '<li> ' + combatFac.getDmgType(el.res[i]) + ' </li>'
                    }
                    addStuff += '</ul>'
                } else {
                    addStuff += '<span> none </span></li>'
                }
            } else if (el.giver || el.giver == 0) {
                //quest
                $http.get('/getGiver/' + el.giver).then(function(res) {
                    console.log('results from quest-giver search', res.data[0]);
                    addStuff += '<li>Level:' + el.lvl + '</li>';
                    addStuff += '<li>Given by:' + res.data[0].Name + '</li>';
                    addStuff += '</ul>';
                    $('#moreInf').html(addStuff);
                    $('#moreInf').show(200);
                    $('div.modal-footer > button.btn.btn-info').html('Less info');
                })
            } else if (el.energy || el.energy == 0) {
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
                addStuff += 'What are you doing? You broke the game!'
            } else if (el.itemLvl || el.itemLvl == 0) {
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
                    addStuff += '<ul>'
                    for (var i = 0; i < el.res.length; i++) {
                        addStuff += '<li> ' + combatFac.getDmgType(el.res[i]) + ' </li>'
                    }
                    addStuff += '</ul>'
                } else {
                    addStuff += '<span> none </span></li>'
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
        saveGame: function(data,lo,rel) {
            //save game, w/ optional logout
            $http.post('/save',data).then(function(res){
                if (lo && res){
                    $http.get('/logout').then(function(r){
                        window.location.href = './login'
                    });
                }else if(rel && res){
                    $window.location.reload();
                }
            })
        },
        logout: function(usr) {
            //log out, but dont save game (this effectively wipes all progress from last save)
            bootbox.confirm("<span id='resetWarn'>WARNING:</span> You will lose all progress since your last save! Are you sure you wanna stop playing and log out?", function(r) {
                if (r && r!=null){
                    $http.get('/logout').then(function(lo){
                        window.location.href = './login'
                    });
                }
            })
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
                                    }
                                    //the following DOES work (i.e., redirects)
                                    // console.log('Window:',window.location.href)
                                    // window.location.href='./login';
                                $http.post('/reset', credObj).then(function(resp) {
                                    if (resp) {
                                        window.location.replace('./login');
                                        return true;
                                    } else {
                                        return false;
                                    }
                                })
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
        }
    };
});
