app.controller('mob-con', function($scope, $http, $q, $interval, $swipe, $window, UIFac) {
    $scope.currRotX = 0;
    $scope.currRotY = 0;
    $scope.rotX = null;
    $scope.rotY = null;
    $scope.uName = Math.floor(Math.random() * 99999999999).toString(32).replace(/0/g, 'O').toUpperCase(); //username!
    $scope.uiOpts = ['Inventory', 'Skills', 'Bestiary', 'Quests', 'Menu'];
    $scope.currUI = 'Menu';
    $scope.uiObjs = []; //items in current ui menu
    socket.emit('regName', { n: $scope.uName })
    $scope.sendMove = $interval(() => {
        socket.emit('movData', $scope.movObj);
    }, 75);
    socket.on('userRegged', function(data) {
        if (data.n != $scope.uName) {
            return false;
        }
        console.log('getting user data!')
        $http.get('/user/mobGetData/' + data.u).then((rn) => {
            $scope.makeRings(rn.data)
        })
    });
    $scope.rings = [];
    $scope.makeRings = function(data) {
        //make the rings!
        //unfortunately, each ring has a slightly different format, so... yep.
        //Inv first
        var invRing = {
            currRot: 0,
            name: 'Inventory',
            items: []
        }
        var armorBits = ['head', 'feet', 'legs', 'hands', 'chest', 'weap'];
        armorBits.forEach((b) => {
            if (data.equip[b][0]) {
                invRing.items.push({
                    name: `${data.equip[b][0].pre} ${data.equip[b][1].name} ${data.equip[b][2].post}`,
                    bg: null,
                    extra: null
                })
            } else {
                invRing.items.push({
                    name: `No ${b=='weap'?'weapon':'armor on '+b}!`,
                    bg: null,
                    extra: null
                })
            }
        })
        $scope.rings.push(invRing);
        //skills
        var skillRing = {
            currRot: 0,
            name: 'Skills',
            items: []
        }
        data.skills.forEach((sk) => {
            skillRing.items.push({
                name: sk.name,
                bg: sk.imgUrl,
                extra: sk.desc
            })
        })
        $scope.rings.push(skillRing);
        //beasties
        var beastRing = {
            currRot: 0,
            name: 'Bestiary',
            items: data.beasts.map((b) => {
                return {
                    name: b.name,
                    bg: b.imgUrl,
                    extra: b.desc
                }
            })
        }
        if (!beastRing.items.length) {
            beastRing.items.push({
                name: 'None',
                bg: null,
                extra: `You haven't discovered any beasts yet!`
            })
        }
        $scope.rings.push(beastRing)

        $scope.currRing = 0;
        $scope.ringDiam = $("#ring-cont").width() / 2;
        console.log('rings:', $scope.rings)
    }
    $scope.getOp = function(n) {
        var rotAmt = $scope.rings[$scope.currRing].currRot % 360,
            itemRot = n * 360 / $scope.rings[$scope.currRing].items.length;
        if (Math.abs(rotAmt - itemRot) < 15) {
            return 1;
        }
        return .2;
    }
    $scope.itemDesc = function(ri) {
        //do something! Aaaah
        if(ri.extra && typeof ri.extra=='string'){
            //item has an extra, and is most likely a description
            bootbox.alert({
                title:ri.name,
                message:ri.desc,
                callback:$scope.doThing()
            })
        }
    }

    window.onkeydown = function(e) {
        //this is used when we're testing the mobile site on the desktop, since desktop doesn't have a reliable swipe.
        console.log(e.which);
        if (e.which == 83) {
            console.log("BEFORE", $scope.currRing, $scope.rings);
            if ($scope.currRing < $scope.rings.length - 1) {
                $scope.currRing++;
            } else {
                $scope.currRing = 0;
            }
        } else if (e.which == 87) {
            console.log("BEFORE", $scope.currRing, $scope.rings);
            if ($scope.currRing && $scope.currRing != 0) {
                $scope.currRing--;
            } else {
                $scope.currRing = $scope.rings.length - 1;
            }
        } else if (e.which == 65) {
            $scope.rings[$scope.currRing].currRot -= 1;
            if ($scope.rings[$scope.currRing].currRot < 0) {
                $scope.rings[$scope.currRing].currRot = 360 + $scope.rings[$scope.currRing].currRot;
            }
        } else if (e.which == 68) {
            $scope.rings[$scope.currRing].currRot += 1;
            if ($scope.rings[$scope.currRing].currRot > 360) {
                $scope.rings[$scope.currRing].currRot = $scope.rings[$scope.currRing].currRot % 360;
            }
        }
        console.log("AFTER", $scope.currRing, $scope.rings, $scope.rings[$scope.currRing]);
        $scope.$digest();
    };

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
    // $scope.ringChAni = function(newR, oldR) {
    //     if(!$scope.rngChOkay){
    //         return false;
    //     }
    //     if ([].slice.call($('.RingUIEl')).length) {
    //         $('.RingUIEl').animate({ transform: "rotateY(0deg) translateZ(" + $scope.ringSize + "px);" }, {
    //             duration: 500,
    //             complete: function() {

    //                 $scope.currUI = $scope.uiOpts[newR];
    //                 console.log('switched from', $scope.uiOpts[oldR], 'to', $scope.uiOpts[newR])
    //                 if (newR < oldR) {
    //                     //goin up!
    //                     $scope.nextUI = $scope.uiOpts[oldR];
    //                     if (oldR) {
    //                         $scope.prevUI = $scope.uiOpts[oldR - 1];
    //                     } else {
    //                         $scope.prevUI = $scope.uiOpts[$scope.uiOpts.length - 1];
    //                     }
    //                 } else {
    //                     //goin down!
    //                     $scope.prevUI = $scope.uiOpts[oldR];
    //                     if (newR < $scope.uiOpts.length - 2) {
    //                         $scope.nextUI = $scope.uiOpts[newR + 1];
    //                     } else {
    //                         $scope.nextUI = $scope.uiOpts[0];
    //                     }
    //                 }
    //                 console.log('NEW UI OBJECTS:', UIFac.getRingObjs(newR))
    //                 console.log('num ui objs')
    //                 $scope.currRingRot = 0;
    //                 var rData = UIFac.getRingObjs(newR);
    //                 console.log('DATA', rData)
    //                 $scope.uiObjs = rData.objs;
    //                 $scope.rotPer = rData.rot;
    //             }
    //         });
    //     } else {
    //         //no previous ring. First time loading
    //         $scope.currUI = $scope.uiOpts[newR];
    //         console.log('switched from', $scope.uiOpts[oldR], 'to', $scope.uiOpts[newR])
    //         if (newR < oldR) {
    //             //goin up!
    //             $scope.nextUI = $scope.uiOpts[oldR];
    //             if (oldR) {
    //                 $scope.prevUI = $scope.uiOpts[oldR - 1];
    //             } else {
    //                 $scope.prevUI = $scope.uiOpts[$scope.uiOpts.length - 1];
    //             }
    //         } else {
    //             //goin down!
    //             $scope.prevUI = $scope.uiOpts[oldR];
    //             if (newR < $scope.uiOpts.length - 2) {
    //                 $scope.nextUI = $scope.uiOpts[newR + 1];
    //             } else {
    //                 $scope.nextUI = $scope.uiOpts[0];
    //             }
    //         }

    //         console.log('NEW UI OBJECTS:', UIFac.getRingObjs(newR))
    //         console.log('num ui objs')
    //         $scope.currRingRot = 0;
    //         var rData = UIFac.getRingObjs(newR);
    //         console.log('DATA', rData)
    //         $scope.uiObjs = rData.objs;
    //         $scope.rotPer = rData.rot;
    //     }
    //     $scope.rngChOkay=false;
    //     $scope.rngChTimer = setTimeout(function(){
    //         $scope.rngChOkay = true;
    //     },1000)
    // }
    // $scope.uiObjs = UIFac.getRingObjs(0);
    // $scope.chMenRng = function(dir) {
    //     //change the entire ring.
    //     var currMenItem = $scope.uiOpts.indexOf($scope.currUI);
    //     var oldRing = currMenItem;
    //     if (dir && dir !== 0) {
    //         if (currMenItem < $scope.uiOpts.length - 1) {
    //             currMenItem++;
    //         } else {
    //             currMenItem = 0;
    //         }
    //     } else {
    //         if (currMenItem && currMenItem !== 0) {
    //             currMenItem--;
    //         } else {
    //             currMenItem = $scope.uiOpts.length - 1;
    //         }
    //     }
    //     console.log('changing menu ring:', dir, currMenItem, oldRing)
    //     $scope.ringChAni(currMenItem, oldRing); //send this to an animation function so we fade out and fade in the rings!
    // };
    // $scope.oldX;
    // $scope.oldY;
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
        }
        var dx = e.x - $scope.oldX,
            dy = e.y - $scope.oldY;
        $scope.oldX = e.x;
        $scope.oldY = e.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            $scope.rings[$scope.currRing].currRot += dx;
        } else if (Math.abs(dy) > 10 && dy>0) {
            if($scope.currRing>0){
                $scope.currRing--;
            }else{
                $scope.currRing = $scope.rings.length-1;
            }
        } else if(Math.abs(dy)>10){
            if($scope.currRing<$scope.rings.length-1){
                $scope.currRing++;
            }else{
                $scope.currRing = 0;
            }
        }
    }
    $swipe.bind($('body#mob'), { 'move': $scope.parseTouch });
});
