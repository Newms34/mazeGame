app.controller('merch-cont', function($scope, $http, $q, $timeout, $window, econFac, UIFac) {
    //merchants!
    $scope.merchy.prepNpc = function() {
        $scope.merchy.buy = true;
        $scope.merchy.merch = $scope.currNpc;
        $scope.merchy.merch.sez = $scope.merchy.merch.gossip[Math.floor(Math.random() * $scope.merchy.merch.gossip.length)];
    };
    $scope.merchy.itemForPlayer = null;
    $scope.acceptQuest= function(){
        sandalchest.confirm('Accept Quest', 'Are you sure you want to accept this quest?',function(resp){
            if(resp){
                econFac.acceptQuest($scope.user.$scope.merchy.merch.quest.id);
            }    
        })
    }
    $scope.merchy.exchange = function(item, dir, ind) {
        //main sell function
        $scope.moveReady = false;
        angular.element('body').scope().moveReady = false;
        console.log(item)
        var itemFull = item.item[0].pre + ' ' + item.item[1].name + 's ' + item.item[2].post;
        var itemBaseCost = Math.floor(item.item[1].cost * (10 + item.item[0].cost + item.item[2].cost)) / 10;
        console.log('ITEM DATA TO EXCHANGE', item, 'and dir:', dir)
        sandalchest.dialog((dir ? "Sell" : "Buy") + " Items", "How many " + itemFull + " do you want to " + (dir ? "sell" : "buy") + "?<hr/><input type=number value=1 min=1 max=" + item.num + " id='numExch'>", {
            buttons: [{
                text: (dir ? "Sell" : "Buy") + " Items",
                close: true,
                click: function() {
                    var numToExch = parseInt($('#numExch').val());
                    if (dir && dir != 'false') {
                        //for selling, we dont check player munneez.
                        if (numToExch < item.num) {
                            //there'll still be some left over;
                            $scope.playerItems.inv[ind].num -= numToExch;
                        } else {
                            $scope.playerItems.inv.splice(ind, 1);
                        }
                        $scope.playerItems.gold += itemBaseCost * numToExch * .9;
                    } else {
                        //buying
                        if (numToExch * itemBaseCost < $scope.playerItems.gold) {
                            if (numToExch < item.num) {
                                //there'll still be some left over;
                                $scope.merchy.merch.inv[ind].num -= numToExch;
                            } else {
                                $scope.merchy.merch.inv.splice(ind, 1);
                            }
                            var itLoc = -1;
                            for (var i = 0; i < $scope.playerItems.inv.length; i++) {
                                var compName = $scope.playerItems.inv[i].item[0].pre + ' ' + $scope.playerItems.inv[i].item[1].name + 's ' + $scope.playerItems.inv[i].item[2].post
                                if (itemFull == compName) {
                                    //this item already exists, so just increase quantity;
                                    itLoc = i;
                                }
                            }
                            if (itLoc != -1) {
                                $scope.playerItems.inv[itLoc].num += numToExch;
                            } else {
                                //item does not already exist;
                                var itemForPlayer;
                                $scope.merchy.itemForPlayer = angular.copy(item);
                                console.log('ITEM FOR PLAYER', $scope.merchy.itemForPlayer)
                                $scope.merchy.itemForPlayer.num = numToExch;
                                $scope.playerItems.inv.push($scope.merchy.itemForPlayer);
                            }
                            $scope.playerItems.gold -= itemBaseCost * numToExch;
                        } else {
                            sandalchest.alert('You don\'t have enough money to afford ' + numToExch + ' ' + itemFull + 's!')
                        }
                    }
                    UIFac.doPlayerInv($scope.playerItems, $scope.bodyBoxes).then(function(s) {
                        $scope.bodyBoxes = s;
                        $scope.currUIObjs = $scope.playerItems.inv;
                    });
                    angular.element('body').scope().moveReady = true;
                    $scope.moveReady = true;
                }
            }, {
                text: 'Cancel',
                close: true,
                click: function() {
                    //dont sell/buy
                    angular.element('body').scope().moveReady = true;
                    $scope.moveReady = true;
                }
            }]
        })

    };
});
