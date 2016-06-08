app.controller('mob-con', function($scope, $http, $q, $interval, $window) {
    $scope.currRotX = 0;
    $scope.currRotY = 0;
    $scope.rotX = null;
    $scope.rotY = null;
    $scope.uName = 'retrieving...'; //username!
    $scope.getUn = function() {
        var nounStart = String.fromCharCode(65 + Math.floor(Math.random() * 25));
        var adjStart = String.fromCharCode(65 + Math.floor(Math.random() * 25));
        $.ajax({
            dataType: 'jsonp',
            url: 'https://simple.wiktionary.org/w/api.php?action=query&list=categorymembers&format=json&cmsort=sortkey&cmstartsortkeyprefix=' + nounStart + '&cmlimit=500&cmtitle=Category:Nouns',
            success: function(nounRes) {
                var noun = ' ';
                while (noun.indexOf(' ') != -1) {
                    noun = nounRes.query.categorymembers[Math.floor(Math.random() * nounRes.query.categorymembers.length)].title;
                    console.log(noun, noun.indexOf(' '))
                }
                //got the noun. Now the adjective!
                console.log('final noun:', noun)
                $.ajax({
                    dataType: 'jsonp',
                    url: 'https://simple.wiktionary.org/w/api.php?action=query&list=categorymembers&format=json&cmsort=sortkey&cmstartsortkeyprefix=' + adjStart + '&cmlimit=500&cmtitle=Category:Adjectives',
                    success: function(adjRes) {
                        var adj = ' ';
                        while (adj.indexOf(' ') != -1) {
                            adj = adjRes.query.categorymembers[Math.floor(Math.random() * adjRes.query.categorymembers.length)].title;
                            console.log(adj, adj.indexOf(' '))
                        }
                        $scope.uName = adj + ' ' + noun;
                        $scope.movObj.n = $scope.uName;
                        //basically just to register name
                        socket.emit('movData', $scope.movObj);
                        $scope.$digest();
                    }
                })
            }
        })
    }
    $scope.sendMove = $interval(function() {
        if ($scope.uName != 'retrieving...' && $scope.isMoving) {
            //if we've registered a username and there is a movement to be submitted
            socket.emit('movData', $scope.movObj)
        }
    }, 75);
    $scope.isMoving = false;
    $scope.movObj = {
        x:$scope.rotX,
        y:$scope.rotY,
        n:null
    };
    $window.onmousemove = function($event) {
        //i may eventually disable this for mobile use
        if ($scope.uName != 'retrieving...') {
            var rotX = Math.floor(200 * (($event.x / $(window).width()) - .5));
            var rotY = Math.floor(200 * (($event.y / $(window).height()) - .5));
            $scope.isMoving = false;
            //detect movement in x and y directions.
            if (rotX > 50) {
                $scope.rotX = 'r';
                $scope.isMoving = true;
            } else if (rotX < -50) {
                $scope.rotX = 'l'
                $scope.isMoving = true;
            }else{
                $scope.rotX = null;
            }
            if (rotY < -50) {
                $scope.rotY = 'f';
                $scope.isMoving = true;
            } else if (rotY > 50) {
                $scope.rotY = 'b';
                $scope.isMoving = true;
            }else{
                $scope.rotY = null;
            }
            $scope.movObj = {
                x: $scope.rotX,
                y: $scope.rotY,
                n: $scope.uName
            }
        }
    }
    $window.addEventListener('deviceorientation', function($event) {
        //i may eventually disable this for mobile use
        if ($scope.uName != 'retrieving...') {
            var rotX = Math.floor(($event.gamma / 90) * 120);
            var rotY = Math.floor(($event.beta / 90) * 120);
            $scope.isMoving = false;
            if (rotX > 50) {
                $scope.rotX = 'r';
                $scope.isMoving = true;
            } else if (rotX < -50) {
                $scope.rotX = 'l'
                $scope.isMoving = true;
            }else{
                $scope.rotX = null;
            }
            if (rotY < -35) {
                $scope.rotY = 'f';
                $scope.isMoving = true;
            } else if (rotY > 35) {
                $scope.rotY = 'b';
                $scope.isMoving = true;
            }else{
                $scope.rotY = null;
            }
            $scope.movObj = {
                x: $scope.rotX,
                y: $scope.rotY,
                n: $scope.uName
            }
        }
    });
    $scope.getUn();
});
