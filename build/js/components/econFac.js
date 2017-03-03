app.factory('econFac', function($http, $q) {
    var npcTypes = ['merch', 'ambient', 'quest']
    return {
        merchInv: function(invArr,id) {
            //get all item info from backend 
            return $http.get('/item/allItems/').then(function(d) {
                console.log('GETTING ITEM DATA:invArr', invArr, d)
                    //now parse the inventory data, and return the object of that merch's inv
                    //lootTypes: 0 = armor, 1 =weapon, 2 = junk... others?
                    //array types (not NOT necessarily == lootTypes): [0]armor, [1] weaps, [2]affixes, [3]junk
                invArr.forEach(function(it) {
                    if (it.lootType == 0 || it.lootType == 1 && it.item.length == 3) {
                        //weapon/armor with affixes
                        //first, we do the affixes.
                        for (var i = 0; i < d.data[2].length; i++) {
                            if (it.item[0] == d.data[2][i].num) {
                                //found the affix!
                                it.item[0] = angular.copy(d.data[2][i]);
                            }
                            if (it.item[2] == d.data[2][i].num) {
                                //found the affix!
                                it.item[2] = angular.copy(d.data[2][i]);
                            }
                        }
                        if (it.lootType == 0) {
                            //armor!
                            for (var i = 0; i < d.data[0].length; i++) {
                                if (it.item[1] == d.data[0][i].num) {
                                    //found the affix!
                                    it.item[1] = angular.copy(d.data[0][i]);
                                }
                            }
                        } else {
                            //weap!
                            for (var i = 0; i < d.data[1].length; i++) {
                                if (it.item[1] == d.data[1][i].num) {
                                    //found the affix!
                                    it.item[1] = angular.copy(d.data[1][i]);
                                }
                            }
                        }
                    } else {
                        //should NEVER be here, as merchants do not sell junk. only the highest quality mats. Amazing mats. The best mats. We're gonna make merchanting great again.
                        throw new Error('FOUND JUNK ' + JSON.stringify(it) + ' in inventory of merch!');
                    }
                })
                console.log('POPULATED MERCH INV',invArr)
                return {
                    inv: invArr,
                    id: id
                };
            })
        },
        getNpc: function(i) {
            return $http.get('/other/oneNpc/' + i).then(function(n) {
                return {
                    data: n.data.data,
                    id: n.data.i
                };
            })
        },
        getQuests: function(name, id, lvl) {
            var idArr = id.split('-')
            return $http.get('/quest/npcQ/' + idArr[0] + '/' + idArr[1] + '/' + lvl + '/' + name).then(function(q) {
                return q.data;
            })
        },
    };
});
