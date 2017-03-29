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
        checkName: function(name) {
            console.log('NAME TO BACKEND', name)
                //note that below we're returning the ENTIRE http.get (the
                //asynchronous call). This allows us to use promisey things
                //like '.then()' on it in the controller.
            return $http.get('/user/nameOkay/' + name).then(function(nameRes) {
                console.log('NAME RESPONSE:', nameRes.data)
                if (nameRes.data == 'okay') {
                    return false
                } else {
                    return true;
                }
            })
        },
        login: function(creds) {
            console.log('credentials in factory', creds);
            return $http.post('/user/login', creds).then(function(logRes) {
                console.log('response from backend:', logRes)
                if (logRes.data == 'yes') {
                    return true;
                } else {
                    return false;
                }
            })
        },
        checkLogin: function() {
            return $http.get('/user/chkLog').then(function(chkLog) {
                console.log('CHECKLOG RESULTS', chkLog)
                return chkLog.data;
            })
        },
        getVoteExpl: function(inp) {
            console.log('Clicked', inp);
            var voteExplanations = {
                Name: 'Your armor, weapon or skill&rsquo;s Name.',
                Desc: 'Your armor, weapon or skill&rsquo;s Description.',
                Def: 'Some weapons provide defense!',
                DefArmor: 'How much this armor reduces damage.',
                Lvl: 'The armor, weapon or skill&rsquo;s level. This is roughly equivalent to a dungeon level!',
                Cost: 'How much your armor, weapon or skill costs in gold pieces',
                Min: 'Weapons do a random amount of damage between a minimum and maximum amount (not counting skill effects). This is the LOWER end of that range.',
                Max: 'Weapons do a random amount of damage between a minimum and maximum amount (not counting skill effects). This is the HIGHER end of that range.',
                Slot: 'Armor pieces fit on a particular slot: Head, Chest, Pants, Gloves, Boots, or None. Items in a "none" slot simply stay in inventory.',
                Res: 'Your armor can provide resistance against certain damage types.',
                Heavy: 'Armors are restricted by weight, so a necromancer and sorcerer can only wear LIGHT armor, while a paladin and warrior can only wear HEAVY armor.',
                Energy: 'How much energy your skill takes to cast.',
                Heal: 'Heal, or Burst Heal, is a one-time effect that restores a portion of your health on casting. Generally, Burst Heals are stronger than Regen heals per unit time, but they don&rsquo;t last as long. Compare with Regeneration.',
                Regen: 'Regen, or Regeneration, is a heal-over-time effect. Generally, regen heals are weaker per unit time than Burst Heals, but this is counteracted by their heal-over-time effect. Compare with Burst Heal.',
                Burst: 'Burst, Damage, or Burst Damage is pretty much what it sounds like: one walloping great smack of damage. It happens all at once tho, so if your enemy survives it, you will need to come up with a new plan.',
                Degen: 'Caused by effects like Burning, Bleeding, and Poison, Degeneration allows you to damage your foe a little bit over time. Great for adding a bit of pressure!',
                Type: 'The type of damage done by your skill. Be aware that certain enemies are resistant to certain damage types, so attacking a Flame Elemental with a fire-based attack may not be the best use of your time.',
                Prev: 'Except for the base skills - Bandage, Swing, Fireball, Chill, Curse, Smite, and Divine Blessing - every skill in the game has a "previous skill". In order to learn your skill, a player will need to have enough skill points AND own the previous skill.',
                ExtraFx: 'Certain skills have additional effects. For example, the warrior&rsquo;s Uppercut stuns.',
                Image: 'All skills require a skill icon!'
            }
            sandalchest.alert('Explanation', voteExplanations[inp])
        }
    };
});
