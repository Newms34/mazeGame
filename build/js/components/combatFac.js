app.factory('combatFac', function($http) {
	var dmgTypes = ['&#9876; Physical','&#128293; Fire','&#10052; Ice','&#128167; Poison','&#128128; Dark','&#128328; Holy'];
	return {
		getDmgType:function(typeNum){
			return dmgTypes[parseInt(typeNum)];
		}
	};
});