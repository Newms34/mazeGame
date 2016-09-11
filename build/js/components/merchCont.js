app.controller('merch-cont', function($scope, $http, $q, $timeout, $window, econFac) {
    //merchants!
    console.log('THING RUNNING')

    $scope.merchy.prepNpc = function() {
        $scope.merchy.merch = $scope.currNpc;
        console.log('FROM MERCH CONT', $scope.merchy)
        $scope.merchy.merch.sez = $scope.merchy.merch.gossip[Math.floor(Math.random()*$scope.merchy.merch.gossip.length)];
        console.log(econFac.merchInv,typeof $scope.merchy.merch.inv)
        var realInv = econFac.merchInv($scope.merchy.merch.inv).then(function(r){
        	console.log('THIS NPC HAS:',r)
        	for (var n = 0;n<$scope.merchy.merch.inv.length;n++){
        		$scope.merchy.merch.inv[n].item = r[n];
        	}
        	// $scope.merchy.merch.inv = r
        	$scope.$apply();
        })
    };
});
