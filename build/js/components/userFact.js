app.factory('userFact', function($http) {
    return {
        checkPwdStr: function(pwd) {
            console.log('password:', pwd)
            var alphCap = new RegExp('[A-Z]', 'g');
            var alphLow = new RegExp('[a-z]', 'g');
            var nums = new RegExp('[0-9]', 'g');
            var weirds = new RegExp('\\W', 'g');
            var pwdStr = 0;
            if (pwd.search(alphCap) != -1) {
                pwdStr++;
            }
            if (pwd.search(alphLow) != -1) {
                pwdStr++;
            }
            if (pwd.search(nums) != -1) {
                pwdStr++;
            }
            if (pwd.search(weirds) != -1) {
                pwdStr++;
            }
            var len = pwd.length;
            if (len > 16) {
                pwdStr += 6
            } else if (len > 11) {
                pwdStr += 4;
            } else if (len > 6) {
                pwdStr += 2
            }
            return pwdStr;
        },
        checkPwdMatch: function(one, two) {
            if (one == two) {
                return true;
            } 
            return false;
        },
        checkName: function(name){
        	console.log('NAME TO BACKEND',name)
        	//note that below we're returning the ENTIRE http.get (the
        	//asynchronous call). This allows us to use promisey things
        	//like '.then()' on it in the controller.
        	return $http.get('/user/nameOkay/'+name).then(function(nameRes){
        		console.log('NAME RESPONSE:',nameRes.data)
        		if (nameRes.data=='okay'){
        			return false
        		}else{
        			return true;
        		}
        	})
        },
        login:function(creds){
        	console.log('credentials in factory',creds);
        	return $http.post('/user/login',creds).then(function(logRes){
        		console.log('response from backend:',logRes)
        		if (logRes.data=='yes'){
        			return true;
        		}else{
        			return false;
        		}
        	})
        },
        checkLogin: function(){
        	return $http.get('/user/chkLog').then(function(chkLog){
        		console.log('CHECKLOG RESULTS',chkLog)
        		return chkLog.data;
        	})
        }
    };
});