app.factory('UIFac', function($http, $q) {
    return {
        getUIObj: function(whichUI, UIStuff) {
        	//get all the data
            var p = $http.get('/' + whichUI).success(function(res) {
                return res;
            });
            return p;
        },
        getUIBg: function(which){
        	var UIBgs = {
                Inventory: '../img/UI/inv.jpg',
                Skills: '',
                Bestiary: '',
                Quests: ''
            };
            return UIBgs[which];
        },
        sendUserUI:function(which){
        	var p = $http.get('/user/' + whichUI).success(function(res) {
                return res;
            });
            return p;
        }
    };
});
