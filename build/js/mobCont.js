app.controller('mob-con', function($scope, $http, $q, $interval, $swipe, $window, UIFac) {
    $scope.currRotX = 0;
    $scope.currRotY = 0;
    $scope.rotX = null;
    $scope.rotY = null;
    $scope.uName = 'retrieving...'; //username!
    $scope.uiOpts = ['Inventory', 'Skills', 'Bestiary', 'Quests', 'Menu'];
    $scope.prevUI = 'Quests';
    $scope.currUI = 'Menu';
    $scope.nextUI = 'Inventory'
    $scope.uiObjs = []; //items in current ui menu
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
                }
                //got the noun. Now the adjective!
                console.log('final noun:', noun);
                $.ajax({
                    dataType: 'jsonp',
                    url: 'https://simple.wiktionary.org/w/api.php?action=query&list=categorymembers&format=json&cmsort=sortkey&cmstartsortkeyprefix=' + adjStart + '&cmlimit=500&cmtitle=Category:Adjectives',
                    success: function(adjRes) {
                        var adj = ' ';
                        while (adj.indexOf(' ') != -1) {
                            adj = adjRes.query.categorymembers[Math.floor(Math.random() * adjRes.query.categorymembers.length)].title;
                        }
                        $scope.uName = adj.toLowerCase() + ' ' + noun.toLowerCase();
                        $scope.movObj.n = $scope.uName;
                        //basically just to register name
                        socket.emit('movData', $scope.movObj);
                        $scope.$digest();
                    }
                });
            }
        });
    };
    $scope.getUn();
    $scope.sendMove = $interval(function() {
        if ($scope.uName != 'retrieving...' && $scope.isMoving) {
            //if we've registered a username and there is a movement to be submitted
            socket.emit('movData', $scope.movObj);
        }
    }, 75);
    $scope.isMoving = false;
    $scope.movObj = {
        x: $scope.rotX,
        y: $scope.rotY,
        n: null
    };
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
                $scope.rotX = 'l';
                $scope.isMoving = true;
            } else {
                $scope.rotX = null;
            }
            if (rotY < -35) {
                $scope.rotY = 'f';
                $scope.isMoving = true;
            } else if (rotY > 35) {
                $scope.rotY = 'b';
                $scope.isMoving = true;
            } else {
                $scope.rotY = null;
            }
            $scope.movObj = {
                x: $scope.rotX,
                y: $scope.rotY,
                n: $scope.uName
            };
        }
    });
    $scope.ringSize = 275;
    $scope.currRingRot = 0;
    $scope.rngChTimer;
    $scope.rngChOkay=true;
    $scope.ringChAni = function(newR, oldR) {
        if(!$scope.rngChOkay){
            return false;
        }
        if ([].slice.call($('.RingUIEl')).length) {
            $('.RingUIEl').animate({ transform: "rotateY(0deg) translateZ(" + $scope.ringSize + "px);" }, {
                duration: 500,
                complete: function() {

                    $scope.currUI = $scope.uiOpts[newR];
                    console.log('switched from', $scope.uiOpts[oldR], 'to', $scope.uiOpts[newR])
                    if (newR < oldR) {
                        //goin up!
                        $scope.nextUI = $scope.uiOpts[oldR];
                        if (oldR) {
                            $scope.prevUI = $scope.uiOpts[oldR - 1];
                        } else {
                            $scope.prevUI = $scope.uiOpts[$scope.uiOpts.length - 1];
                        }
                    } else {
                        //goin down!
                        $scope.prevUI = $scope.uiOpts[oldR];
                        if (newR < $scope.uiOpts.length - 2) {
                            $scope.nextUI = $scope.uiOpts[newR + 1];
                        } else {
                            $scope.nextUI = $scope.uiOpts[0];
                        }
                    }
                    console.log('NEW UI OBJECTS:', UIFac.getRingObjs(newR))
                    console.log('num ui objs')
                    $scope.currRingRot = 0;
                    var rData = UIFac.getRingObjs(newR);
                    console.log('DATA', rData)
                    $scope.uiObjs = rData.objs;
                    $scope.rotPer = rData.rot;
                }
            });
        } else {
            //no previous ring. First time loading
            $scope.currUI = $scope.uiOpts[newR];
            console.log('switched from', $scope.uiOpts[oldR], 'to', $scope.uiOpts[newR])
            if (newR < oldR) {
                //goin up!
                $scope.nextUI = $scope.uiOpts[oldR];
                if (oldR) {
                    $scope.prevUI = $scope.uiOpts[oldR - 1];
                } else {
                    $scope.prevUI = $scope.uiOpts[$scope.uiOpts.length - 1];
                }
            } else {
                //goin down!
                $scope.prevUI = $scope.uiOpts[oldR];
                if (newR < $scope.uiOpts.length - 2) {
                    $scope.nextUI = $scope.uiOpts[newR + 1];
                } else {
                    $scope.nextUI = $scope.uiOpts[0];
                }
            }

            console.log('NEW UI OBJECTS:', UIFac.getRingObjs(newR))
            console.log('num ui objs')
            $scope.currRingRot = 0;
            var rData = UIFac.getRingObjs(newR);
            console.log('DATA', rData)
            $scope.uiObjs = rData.objs;
            $scope.rotPer = rData.rot;
        }
        $scope.rngChOkay=false;
        $scope.rngChTimer = setTimeout(function(){
            $scope.rngChOkay = true;
        },1000)
    }
    $scope.uiObjs = UIFac.getRingObjs(0);
    $scope.chMenRng = function(dir) {
        //change the entire ring.
        var currMenItem = $scope.uiOpts.indexOf($scope.currUI);
        var oldRing = currMenItem;
        if (dir && dir !== 0) {
            if (currMenItem < $scope.uiOpts.length - 1) {
                currMenItem++;
            } else {
                currMenItem = 0;
            }
        } else {
            if (currMenItem && currMenItem !== 0) {
                currMenItem--;
            } else {
                currMenItem = $scope.uiOpts.length - 1;
            }
        }
        console.log('changing menu ring:', dir, currMenItem, oldRing)
        $scope.ringChAni(currMenItem, oldRing); //send this to an animation function so we fade out and fade in the rings!
    };
    $scope.oldX;
    $scope.oldY;
    $scope.noScroll = function(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.cancelBubble = true;
        e.returnValue = false;
    };
    $scope.parseTouch = function(e) {
        $scope.noScroll(e);
        if (!$scope.oldX || !$scope.oldY) {
            $scope.oldX = e.x;
            $scope.oldY = e.y;
            return false; //no previous pos data, so just end
            //a 'if unwanted condition: return false' construction like this is known as "Short-Circuiting"
        }
        var dx = e.x - $scope.oldX,
            dy = e.y - $scope.oldY;
        $scope.oldX = e.x;
        $scope.oldY = e.y;
    
        if (Math.abs(dx) > Math.abs(dy)) {

                //horizontal movement (spin rings)
            $scope.currRingRot = UIFac.PlatinumSpinningRings($scope.currRingRot, dx);
        } else if (Math.abs(dy) > 10) {

            $scope.chMenRng(dy > 0 ? 0 : 1);
        } else {
            return false;
        }
    }
    $scope.chMenRng(1); //we run this once by default to get our current ring's stuff
    $scope.chMenRng(1);
    $swipe.bind($('body#mob'), { 'move': $scope.parseTouch });


});
