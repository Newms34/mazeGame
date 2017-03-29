app.controller('vote-con', function($scope, $http, userFact, $window) {
    userFact.checkLogin().then(function(resp) {
        if (!resp) {
            $window.location.href = './login';
        } else {
            $scope.user = resp; //should be username;
            refreshVotes();
        }
    });
    $scope.skillVotes = [];
    $scope.newSlots = [{
        lbl: '\uD83C\uDFA9 Head',
        num: 0
    }, {
        lbl: '\uD83D\uDC55 Chest',
        num: 1
    }, {
        lbl: '\uD83D\uDC56 Pants',
        num: 2
    }, {
        lbl: '\u261E Gloves',
        num: 3
    }, {
        lbl: '\uD83D\uDC62 Boots',
        num: 4
    }, {
        lbl: '\uD83D\uDC8D None',
        num: 5
    }];
    $scope.explVoteFld  = userFact.getVoteExpl;
    $scope.armorVotes = [];
    $scope.weapVotes = [];
    $scope.slots = ['\uD83C\uDFA9', '\uD83D\uDC55', '\uD83D\uDC56', '\u261E', '\uD83D\uDC62', '\uD83D\uDC8D']
    $scope.dtypes = ['Physical', 'Fire', 'Ice', 'Poison', 'Dark', 'Holy'];
    $scope.items = {
            armors: [],
            weaps: [],
            skills: []
        }
        //get initial list of votes
    $scope.sortCols = {
        weaps: 'num',
        skills: 'id',
        armors: 'num'
    }
    $scope.sortRev = {
        weaps: false,
        skills: false,
        armors: false
    }
    $scope.newItemCat = 'weap'; //meow
    $scope.chSort = function(col, tbl) {
        console.log('CHSORT', col, tbl, $scope.sortCols[tbl])
        if (col == $scope.sortCols[tbl]) {
            //reverse a row;
            $scope.sortRev[tbl] = !$scope.sortRev[tbl];
        } else {
            $scope.sortRev[tbl] = false;
            $scope.sortCols[tbl] = col;
        }
    }
    $scope.moveBar = function(s, e) {
        if (!s.voted) {
            s.voteCurr = 5 * e.offsetX / $(e.target).width();
            if (s.voteCurr > 5) {
                s.voteCurr = 5;
            }
        }
    }
    $scope.resetBar = function(s) {
        s.voteCurr = s.votes;
    }
    $scope.scrt=-40;
    $scope.scrollToDiv = function(id){
        console.log(id, $('#'+id).position().top);
        $(window).scrollTop($('#'+id).position().top);
    }
    window.onscroll=function(e){
        $scope.scrt = $(window).scrollTop()-40;
        $scope.$digest();
    }
    $scope.goGame = function(){
        sandalchest.confirm('Return to Game', 'Are you sure you want to stop voting and return to the game?',function(resp){
            if(resp){
                $window.location.href = './'
            }
        },{parent:'.vote-nav'})
    }
    $scope.newItemCat = 'weap';
    $scope.chVotePan = function(n){
        if(n == $scope.newItemCat){
            return false;
        }else{
            $('#'+$scope.newItemCat+'-vote').hide(200,function(){
                $scope.newItemCat = n;
                $('#'+$scope.newItemCat+'-vote').show(200);
                $scope.$digest();
            });
        }
    }
    var refreshVotes = function() {
        $http.get('./voting/voteList').then(function(v) {
            $scope.skillVotes = [];
            $scope.armorVotes = [];
            $scope.weapVotes = [];
            $scope.items = {
                armors: [],
                weaps: [],
                skills: []
            };
            console.log(v.data.votes)
                //votes
            v.data.votes.forEach(function(r) {
                if (r.type == 0) {
                    r.weap.votes = r.votes.reduce(function(a, b) {
                        return a + b;
                    }) / r.votes.length;
                    r.weap.voteCurr = r.weap.votes;
                    r.weap.vid = r.vid;
                    r.weap.voted = r.votedUsrs && r.votedUsrs.indexOf($scope.user) > -1;
                    $scope.weapVotes.push(r.weap);
                } else if (r.type == 1) {
                    r.armor.votes = r.votes.reduce(function(a, b) {
                        return a + b;
                    }) / r.votes.length;
                    r.armor.voteCurr = r.armor.votes;
                    r.armor.vid = r.vid;
                    r.armor.voted = r.votedUsrs && r.votedUsrs.indexOf($scope.user) > -1;
                    $scope.armorVotes.push(r.armor);
                } else if (r.type == 2) {
                    r.skill.votes = r.votes.reduce(function(a, b) {
                        return a + b;
                    }) / r.votes.length;
                    r.skill.voteCurr = r.skill.votes;
                    r.skill.vid = r.vid;
                    r.skill.voted = r.votedUsrs && r.votedUsrs.indexOf($scope.user) > -1;
                    $scope.skillVotes.push(r.skill);
                    console.log(r.skill)
                }
            });

            $scope.items.armors = v.data.armor;
            $scope.items.weaps = v.data.weaps;
            $scope.items.skills = v.data.skills;
            //construct fx list
            $scope.items.skills.forEach(function(sk) {
                sk.effectList = [];
                if (sk.stuns) {
                    sk.effectList.push('Stuns')
                }
                if (sk.extraFx.dmgVsStun) {
                    sk.effectList.push('Extra dmg vs. Stunned')
                }
                if (sk.extraFx.protection) {
                    sk.effectList.push('Adds Protection on next hit')
                }
                if (sk.extraFx.dmgVsDegen) {
                    sk.effectList.push('Extra dmg vs. Degenned Foes')
                }
                if (sk.extraFx.critChance) {
                    sk.effectList.push('Chance of critical hit')
                }
            });
            $scope.items.armors.forEach(function(ar) {
                ar.resList = [];
                ar.res.forEach(function(arRz) {
                    ar.resList.push($scope.dtypes[arRz]);
                })
            })
        });
    }
    $scope.concatRes = function(r){
        var resArr = [];
        $scope.dtypes.forEach(function(f,i){
            if (r[f]){
                resArr.push(i);
            }
        })
        return resArr;
    }
    $scope.doVote = function(s, e) {
            console.log('VID', s)
            var voStuff = {
                id: s.vid,
                val: 5 * e.offsetX / $(e.target).width(),
                usr: $scope.user
            }
            if (s.voted) {
                sandalchest.alert('Sorry, but you\'ve already voted for this item!',{parent:'.vote-nav'})
            } else {
                s.voted = true;
                console.log('user wants to vote ', s.voteCurr, 'for', s.name, 'voted', s.voted)
                $http.post('./voting/doVote', voStuff).then(function(r) {
                    console.log('RESPONSE FROM VOTES:', r)
                    refreshVotes();
                })
            }
        }
        //NOTE for the following: num (w & a) and id (s) is NOT defined! this is defined on the backend once the skill's voted in!
    $scope.subArmorVote = function() {
        var newVote = {
                type: 1
            },
            err = false;
        if (false) {
            //errs
        } else {
            newVote.armor = {
                name: $scope.newIt.name,
                desc: $scope.newIt.desc,
                cost: $scope.newIt.cost,
                def: $scope.newIt.def,
                slot: $scope.newIt.slot,
                res: $scope.concatRes($scope.newIt.res),
                itemLvl: $scope.newIt.itemLvl,
                heavy: $scope.newIt.heavy
            }
            newVote.vid = Math.floor(Math.random() * 99999).toString(32);
            newVote.votedUsrs = $scope.user;
            newVote.votes = [];
            newVote.votesOpen = true;
            newVote.user = $scope.user;
            $http.post('./voting/subVote',newVote).then(function(r){
                console.log(r)
            })
            console.log('NEW ARMOR:', newVote)
        }
    };
    $scope.subWeapVote = function() {
        var newVote = {
            type: 0
        }
        if (err) {
            //errs
        } else {
            newVote.weap = {
                name: $scope.newIt.name,
                desc: $scope.newIt.desc,
                cost: $scope.newIt.cost,
                def: $scope.newIt.def,
                itemLvl: $scope.newIt.itemLvl,
                min: $scope.newIt.min,
                max: $scope.newIt.max
            }
            newVote.vid = Math.floor(Math.random() * 99999).toString(32);
            newVote.votedUsrs = $scope.user;
            newVote.votes = [];
            newVote.votesOpen = true;
            console.log('NEW WEAPON:', newVote)
        }
    };
    $scope.newIt = {};
    $scope.subSkillVote = function() {
        //note that the name of this function is 'sub skill vote'. Not 'subs kill vote'. We have nothing against submarines taking part in the electoral process.
        var newVote = {
                type: 2
            }
            //check img dims
        console.log('imgData', $scope.icon);
        if (!$scope.icon.icon) {
            //no img err
            sandalchest.alert('Error', 'Skills require a skill icon! Please pick one.', function() {
                return false;
            },{parent:'.vote-nav'});
        } else if ($scope.icon.width > 170 || $scope.icon.height > 170) {
            //img too large err
            sandalchest.alert('Error', 'Your image is too large! Please use the bars to resize it, or considering picking a different image.', function() {
                return false;
            },{parent:'.vote-nav'});
        } else if ($scope.icon.width < 15 || $scope.icon.height < 15) {
            //img too smol err
            sandalchest.alert('Error', 'Your image is too small! What is this, an image for ants?', function() {
                return false;
            },{parent:'.vote-nav'});
        } else if ($scope.icon.width / $scope.icon.height > 2 || $scope.icon.width / $scope.icon.height < 0.5) {
            //img weird dims
            sandalchest.alert('Error', 'Your image has strange dimensions! Images should be approximately square', function() {
                return false;
            },{parent:'.vote-nav'});
        } else if (!$scope.newIt.name || !$scope.newIt.desc || (!$scope.newIt.energy && $scope.newIt.energy !== 0) || (!$scope.newIt.heal && !$scope.newIt.burst && !$scope.newIt.regen && !$scope.newIt.degen) || !$scope.newIt.type || !$scope.newIt.prevSkill) {

            //any other stuff not defined!
            sandalchest.alert('Error', 'One or more of your skill&rsquo;s parameters is undefined!', function() {
                return false;
            },{parent:'.vote-nav'});
        } else {
            newVote.skill = {
                name: $scope.newIt.name,
                desc: $scope.newIt.desc,
                energy: $scope.newIt.energy,
                heal: $scope.newIt.heal || 0,
                regen: $scope.newIt.regen || 0,
                burst: $scope.newIt.burst || 0,
                degen: $scope.newIt.degen || 0,
                type: $scope.dtypes.indexOf($scope.newIt.type) > -1 ? $scope.dtypes.indexOf($scope.newIt.type) : 0,
                prevSkill: $scope.newIt.prevSkill || 0,
                stuns: $scope.newIt.stuns,
                extraFx: $scope.newIt.extraFx,
                imgUrl: $scope.icon.icon
            }
            newVote.vid = Math.floor(Math.random() * 99999).toString(32);
            newVote.votedUsrs = $scope.user;
            newVote.votes = [];
            newVote.votesOpen = true;
            console.log('NEW SKILL:', newVote)
        }
    }
    $scope.sayIt = function() {
        console.log($scope.newIt)
    }
    $scope.canv = document.querySelector('canvas');
    $scope.ctx = $scope.canv.getContext("2d");
    $scope.icon = {
        width: 100,
        height: 100,
        maxWidth: 100,
        maxHeight: 100
    };
    $scope.getImage = function(e) {
        console.log(e);
        var reader = new FileReader();
        reader.onload = function(event) {
            var img = new Image();
            img.onload = function() {
                $scope.icon.width = img.width;
                $scope.icon.height = img.height;
                $scope.icon.maxWidth = img.width;
                $scope.icon.maxHeight = img.height;

                $scope.canv.style.width = img.width + 'px';
                $scope.canv.style.height = img.height + 'px';
                $scope.$digest();
                console.log($scope.icon.maxWidth, img.width, $scope.icon.maxHeight, img.height)
                $scope.ctx.drawImage(img, 0, 0);
                $scope.icon.width = img.width;
                $scope.icon.height = img.height;
                $scope.$digest();
                setTimeout(function() {
                    $scope.icon.width = img.width;
                    $scope.icon.height = img.height;
                    $scope.$digest();
                }, 1)
                $scope.icon.icon = $scope.canv.toDataURL();
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    };
    document.querySelector('#filepkr').addEventListener('change', $scope.getImage, false);
});
