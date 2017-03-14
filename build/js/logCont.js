var app = angular.module('mazeGame', ['ngTouch']).controller('log-con', function($scope, $http, $q, $timeout, $window, userFact) {
    $scope.hazLogd = false;
    $scope.user = {
        prof: '0'
    }
    $scope.profDescs = [{
        name:'Warrior',
        txt: 'What they lack in magical apptitude, warriors more than make up for in their martial expertise. The warrior uses their weapon training to bring swift and steely death to their foes',
        img: './img/assets/war.jpg',
        ico:'./img/assets/warPick.png',
        skill:"Berserker's Fury - Chance to do extra damage on attack."
    }, {
        name:'Sorcerer',
        txt: 'The scholarly sorcerer uses their extensive knowledge of the arcane to obliterate their enemies with magical fire, or hinder them with conjured ice and blizzards.',
        img: './img/assets/sorc.jpg',
        ico:'./img/assets/sorcPick.png',
        skill:"Elemental Mastery - Additional damage versus foes with degen"
    }, {
        name:'Paladin',
        txt: 'The holy paladins are bastions of the Holy Ones. Using their faith both offensively as a shield and defensively as a weapon, they can both smite their enemies and renew themselves.',
        img: './img/assets/paly.jpg',
        ico:'./img/assets/palyPick.png',
        skill:"Righteous Fury - Heal or regen for a small amount on attack"
    }, {
        name:'Necromancer',
        txt: 'Masters of the so-called "dark" arts, the necromancers are an oft-maligned lot. However, no one would deny their power - or their usefulness - in turning the minds and even fallen bodies of their foes against them.',
        img: './img/assets/necro.jpg',
        ico:'./img/assets/necroPick.png',
        skill:"Soul Siphon - steal some health on attack"
    }]
    $scope.newUsr = function() {
        //eventually we need to CHECK to see if this user is already taken!
        //for now, we assume not
        if ($scope.regForm.pwd.$viewValue != $scope.regForm.pwdTwo.$viewValue) {
            sandalchest.alert('Your passwords don&rsquo;t match!', function() {

            });
        } else {
            var userInf = {
                user: $scope.regForm.username.$viewValue,
                password: $scope.regForm.pwd.$viewValue,
                prof:$scope.user.prof+1
            };
            console.log('userInf',userInf)
            $http.post('/user/new', userInf).then(function(res) {
                if (res.data == 'saved!') {
                    $scope.login(true);
                }
            });
        }
    };
    $scope.passMatch = true;
    $scope.passStr = 0;
    $scope.isNew = false;
    $scope.checkPwdStr = function() {
        if ($scope.regForm.pwd.$viewValue) {

            $scope.passStr = userFact.checkPwdStr($scope.regForm.pwd.$viewValue);
        }
        console.log('pwd strength', $scope.passStr);
    };
    $scope.checkPwds = function() {
        $scope.passMatch = userFact.checkPwdMatch($scope.regForm.pwd.$viewValue, $scope.regForm.pwdTwo.$viewValue);
    };
    $scope.dupName = false;
    $scope.nameCheck = function() {
        var name = $scope.regForm.username.$viewValue;
        console.log('userFact', userFact.checkName, 'name', name);
        userFact.checkName(name).then(function(resp) {
            $scope.dupName = resp;
        });
    };
    $scope.login = function(n) {
        if (n) {
            //new user. logging them in after we've registered
            userFact.login({
                name: $scope.regForm.username.$viewValue,
                pwd: $scope.regForm.pwd.$viewValue
            }).then(function(lRes) {
                //response back from factory (and thus backend)
                //Did login succeed?
                if (lRes) {
                    $scope.hazLogd = true;
                    $scope.getNews();
                } else {
                    sandalchest.alert('Either your username or password is not correct!')
                }
            });
        } else {
            userFact.login({
                name: $scope.logForm.username.$viewValue,
                pwd: $scope.logForm.pwd.$viewValue
            }).then(function(lRes) {
                //response back from factory (and thus backend)
                //Did login succeed?
                if (lRes) {
                    $scope.hazLogd = true;
                    $scope.getNews();
                } else {
                    sandalchest.alert('Either your username or password is not correct!');
                }
            });
        }
    };
    $scope.play = function() {
        $window.location.href = ('./');
    };
    $scope.passInf = function() {
        sandalchest.alert('<h3>Password Strength</h3><hr/>Here are a few things to include for a stronger password:<ul><li>A lowercase letter</li><li>An uppercase letter</li><li>A number</li><li>A non alpha-numeric symbol (something like "@" or "$")</li></ul>Longer passwords are also generally better!');
    };
    $scope.upd = [];
    $scope.getNews = function() {
        $http.get('/other/news').then(function(res) {
            $scope.upd = res.data.split(/[\n\r]/)
        })
    };
    $scope.getNews(); //REMOVE ME!
    $scope.parseInt = parseInt; //we're exposing this on the front end so that we can do stuff like <div>{{parseInt(someNum)}}</div>
});
