app.factory('econFac', function($http, $q) {
    var npcTypes = ['merch', 'ambient', 'quest']
    return {
        merchInv: function(invArr) {
            //get all item info from backend 
            return $http.get('/item/allItems').then(function(d) {
                var fullInvArr = [];
                console.log('GETTING ITEM DATA:invArr',invArr)
                //now parse the inventory data, and return the object of that merch's inv
                for (var i = 0; i < invArr.length; i++) {
                   if (invArr[i].lootType == 0) {
                        //armor
                        fullInvArr.push([d.data[2][invArr[i].item[0]], d.data[0][invArr[i].item[1]], d.data[2][invArr[i].item[2]]]);
                    } else {
                        //weap
                        fullInvArr.push([d.data[2][invArr[i].item[0]], d.data[1][invArr[i].item[1]], d.data[2][invArr[i].item[2]]]);
                    }
                }
                return fullInvArr;
            })
        },
        getNpc: function(i) {
            return $http.get('/other/oneNpc').then(function(n) {
                return {
                    data: n.data,
                    id: i
                };
            })
        }
    };
});
