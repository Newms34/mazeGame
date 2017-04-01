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
            sandalchest.dialog( all[n].name,all[n].desc, { buttons: [{ text: 'Okay', close: true }] })
        },
        getItems: function() {
            return $http.get('/item/allItems').then(function(s) {
                return s;
            })
        },
        rollLoot: function(mons) {
            return $http.get('/item/byLvl/' + mons.lvl).then(function(i) {
                return i.data;
            })
        },
        addXp: function(u,x,c,l){
            return $http.post('/user/addXp',{xp:x,user:u,cells:c,loc:l},function(r){
                return r;
            })
        },
        besties:function(data){
            return $http.post('/user/addBeast',data).then(function(r){
                return r.data;
            })
        }
    };
});
