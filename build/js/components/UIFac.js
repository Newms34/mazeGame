app.factory('UIFac', function($http, $q,combatFac) {
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
                if(el.res && el.res.length){
                    addStuff+='<ul>'
                    for(var i = 0;i<el.res.length;i++){
                        addStuff+='<li> '+combatFac.getDmgType(el.res[i])+' </li>'
                    }
                    addStuff+='</ul>'
                }else{
                    addStuff+='<span> none </span></li>'
                }
            } else if (el.giver || el.giver == 0) {
                //quest
                addStuff+='<li>still gotta do this! Sorry</li>'
            } else if (el.energy || el.energy == 0) {
                //skill
                addStuff += '<li>Damage Type:' + combatFac.getDmgType(el.type) + '</li>';
                addStuff += '<li>Energy:' + el.energy + '</li>';
                addStuff += el.heal?'<li>Heal (burst):' + el.heal + ' hp</li>':'';
                addStuff += el.regen?'<li>Heal (regeneration):' + el.regen + ' hp/turn</li>':'';
                addStuff += el.burst?'<li>Damage:' + el.burst + ' hp</li>':'';
                addStuff += el.degen?'<li>Degeneration:' + el.degen + ' hp/turn</li>':'';
                addStuff += el.stuns?'<li>Stuns</li>':'';
            } else if (el.maxHp) {
                //user. Shouldn't be this one!
                addStuff+='What are you doing? You broke the game!'
            } else if (el.itemLvl || el.itemLvl == 0) {
                //weapon
                addStuff += el.max?'<li>Damage:' + el.min + '-'+el.max+' hp</li>':'';
                addStuff += el.def?'<li>Defense:' + el.def + '</li>':'';
                addStuff += '<li>Level:'+el.itemLvl+'</li>';
                addStuff += '<li>Cost:'+el.cost+' coins</li>';
            } else {
                //monster
                addStuff += '<li>Level:'+el.lvl+'</li>';
                addStuff += '<li>Hp:'+el.hp+' hp</li>';
                addStuff += '<li>Dmg:' + el.min + '-'+el.max+' hp</li>';
                addStuff += '<li>Damage Type:' +combatFac.getDmgType(el.type)+ '</li>';
                addStuff += '<li>Resistance:';
                if(el.res && el.res.length){
                    addStuff+='<ul>'
                    for(var i = 0;i<el.res.length;i++){
                        addStuff+='<li> '+combatFac.getDmgType(el.res[i])+' </li>'
                    }
                    addStuff+='</ul>'
                }else{
                    addStuff+='<span> none </span></li>'
                }
            }
            addStuff += '</ul>';
            console.log(addStuff)
            $('#moreInf').html(addStuff);
            $('#moreInf').show(200);
            $('div.modal-footer > button.btn.btn-info').html('Less info');
        },
        lessInf: function() {
            $('#moreInf').hide(200);
            $('div.modal-footer > button.btn.btn-info').html('More info');
        }
    };
});
