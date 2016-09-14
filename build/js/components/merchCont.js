app.controller('merch-cont', function($scope, $http, $q, $timeout, $window, econFac) {
    //merchants!
    console.log('THING RUNNING')

    $scope.merchy.prepNpc = function() {
        $scope.merchy.buy = true;
        $scope.merchy.merch = $scope.currNpc;
        console.log('FROM MERCH CONT', $scope.merchy)
        $scope.merchy.merch.sez = $scope.merchy.merch.gossip[Math.floor(Math.random() * $scope.merchy.merch.gossip.length)];
        console.log(econFac.merchInv, typeof $scope.merchy.merch.inv)
        if (!$scope.merchy.merch.alreadyInfoed) {

            var realInv = econFac.merchInv($scope.merchy.merch.inv).then(function(r) {
                console.log('THIS NPC HAS:', r)
                for (var n = 0; n < $scope.merchy.merch.inv.length; n++) {
                    $scope.merchy.merch.inv[n].item = r[n];
                }
                $scope.merchy.merch.alreadyInfoed = true;
                // $scope.merchy.merch.inv = r
                $scope.$apply();
            })
        }
    };
    $scope.merchy.itemForPlayer = null;
    $scope.merchy.exchange = function(item, dir, ind) {
        $scope.moveReady = false;
        angular.element('body').scope().moveReady = false;
        var itemFull = item.item[0].pre + ' ' + item.item[1].name + 's ' + item.item[2].post;
        var itemBaseCost = Math.floor(item.item[1].cost * (10 + item.item[0].cost + item.item[2].cost)) / 10;
        console.log('ITEM DATA TO EXCHANGE', item, 'and dir:', dir)
        bootbox.dialog({
            message: "How many " + itemFull + " do you want to " + (dir ? "sell" : "buy") + "?<hr/><input type=number value=1 min=1 max=" + item.num + " id='numExch'>",
            title: (dir ? "Sell" : "Buy") + " Items",
            buttons: {
                main: {
                    label: (dir ? "Sell" : "Buy") + " Items",
                    className: "btn-success",
                    callback: function() {
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
                                console.log('Scummy merchant didnt even give me my ', item)
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
                                bootbox.alert('You don\'t have enough money to afford ' + numToExch + ' ' + itemFull + 's!')
                            }
                        }
                        angular.element('body').scope().moveReady = true;
                        $scope.moveReady = true;
                        return true;
                    }
                },
                danger: {
                    label: "Cancel",
                    className: "btn-danger",
                    callback: function() {
                        //dont sell/buy
                        angular.element('body').scope().moveReady = true;
                        $scope.moveReady = true;
                        return true;
                    }
                }
            }
        });
    };
});
