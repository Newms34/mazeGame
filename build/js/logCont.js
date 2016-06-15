var app = angular.module('mazeGame', []).controller('log-con', function($scope, $http, $q, $timeout, $window, userFact) {
    $scope.newUsr = function() {
        //eventually we need to CHECK to see if this user is already taken!
        //for now, we assume not
        if ($scope.pwd != $scope.pwdTwo) {
            bootbox.alert('Your passwords don&rsquo;t match!', function() {

            })
        } else {
            var userInf = {
                user: $scope.regForm.username.$viewValue,
                password: $scope.regForm.pwd.$viewValue
            };
            $http.post('/new', userInf).then(function(err, res) {
                console.log('logged in!', err, res)
            })
        }
    }
    $scope.passMatch = true;
    $scope.passStr = 0;
    $scope.checkPwdStr = function() {
        if ($scope.regForm.pwd.$viewValue) {

            $scope.passStr = userFact.checkPwdStr($scope.regForm.pwd.$viewValue);
        }
        console.log('pwd strength', $scope.passStr)
    }
    $scope.checkPwds = function() {
        $scope.passMatch = userFact.checkPwdMatch($scope.regForm.pwd.$viewValue, $scope.regForm.pwdTwo.$viewValue)
    }
    $scope.dupName = false;
    $scope.nameCheck = function() {
        var name = $scope.regForm.username.$viewValue;
        console.log('userFact', userFact.checkName, 'name', name)
        userFact.checkName(name).then(function(resp) {
            $scope.dupName = resp;
        })
    }
    $scope.login = function(){
    	console.log('User',$scope.logForm.username,'wants to login with password',$scope.logForm.pwd);
    	userFact.login({
    		name:$scope.logForm.username.$viewValue,
    		pwd:$scope.logForm.pwd.$viewValue
    	}).then(function(lRes){
    		//response back from factory (and thus backend)
    		//Did login succeed?
    		if (lRes) {
    			//login succeeded!
    		}
    	})
    }
    $scope.parseInt = parseInt;
});
