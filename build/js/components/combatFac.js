app.factory('combatFac', function($http) {
	var dmgTypes = ['Physical','Fire','Ice','Poison','Dark','Holy'];
	return {
		getDmgType:function(typeNum){
			return dmgTypes[parseInt(typeNum)];
		}
	};
});