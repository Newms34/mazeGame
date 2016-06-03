app.controller('mob-con', function($scope, $http, $q, $interval, $window) {
    $scope.currRotX = 0;
    $scope.currRotY = 0;
    $scope.rotX = 0;
    $scope.rotY = 0;
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
                        $scope.$digest();
                    }
                })
            }
        })
    }
    $window.onmousemove = function($event) {
        //i may eventually disable this for mobile use
        if ($scope.uName != 'retrieving...') {
            $scope.rotX = Math.floor(200 * (($event.x / $(window).width()) - .5));
            $scope.rotY = Math.floor(200 * (($event.y / $(window).height()) - .5));
            $scope.$digest();
        }
        var mov = {
            x: $scope.rotX,
            y: $scope.rotY,
            n: $scope.uName
        }
        socket.emit('movData', mov)
    }
    $window.addEventListener('deviceorientation', function($event) {
        //i may eventually disable this for mobile use
        if ($scope.uName != 'retrieving...') {
            $scope.rotX = Math.floor(($event.gamma/90)*120);
            $scope.rotY =  Math.floor(($event.beta/90)*120);
            $scope.$digest();
        }
        var mov = {
            x: $scope.rotX,
            y: $scope.rotY,
            n: $scope.uName
        }
        socket.emit('movData', mov)
    });
    $scope.getUn();

});
