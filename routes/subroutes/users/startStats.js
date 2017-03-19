var startFns = {},
    profs = ['general', 'warrior', 'sorcerer', 'necromancer', 'paladin'],
    mongoose = require('mongoose');
module.exports = startFns;

startFns.getSkills = function(prof) {
    if (prof >= profs.length || profs < 1) {
        return false;
    }
    var retSkills = [0]
    switch (prof) {
        case 1:
            //Warrior
            retSkills = retSkills.concat([2])
            break;
        case 2:
            //Sorc
            retSkills = retSkills.concat([8, 13])
            break;
        case 3:
            //Paly
            retSkills = retSkills.concat([23, 24])
            break;
        default:
            retSkills = retSkills.concat([16])
                //necro

    }
    return retSkills;
    //return the initial list of skills (to be unlocked) for this profession. Since further skills are unlocked as 'branches' off of previous skills, this basically determines ALL of the skills this prof uses.
};
startFns.getEquip = function(prof, affLen) {
    //here, we'll wanna randomly equip lvl 1 armor on the user. User will NOT get a full set, but approximately 50% of the armor. 
    var eq = {
        head: [-1, -1, -1],
        chest: [-1, -1, -1],
        hands: [-1, -1, -1],
        legs: [-1, -1, -1],
        feet: [-1, -1, -1],
        gold: 100,
        weap: [3, 0, 8],
        inv: []
    }
    if (prof >= profs.length || profs < 1) {
        //invalid profession!
        //no modifications
    } else if (prof == 1 || prof == 3) {
        //heavy: 25 head, 36 pants, 37 chest, 39 boots, 41 gloves
        if (Math.random() > .33) {
            eq.head = [Math.floor(Math.random()*affLen), 25, Math.floor(Math.random()*affLen)];
        }
        if (Math.random() > .33) {
            eq.chest = [Math.floor(Math.random()*affLen), 37, Math.floor(Math.random()*affLen)];
        }
        if (Math.random() > .33) {
            eq.hands = [Math.floor(Math.random()*affLen), 41, Math.floor(Math.random()*affLen)];
        }
        if (Math.random() > .33) {
            eq.legs = [Math.floor(Math.random()*affLen), 36, Math.floor(Math.random()*affLen)];
        }
        if (Math.random() > .33) {
            eq.feet = [Math.floor(Math.random()*affLen), 39, Math.floor(Math.random()*affLen)];
        }
    } else {
        //light: 0 head, 1/8 chest, 2 pants, 3/42 gloves, 4 boots
        if (Math.random() > .33) {
            eq.head = [Math.floor(Math.random()*affLen), 0, Math.floor(Math.random()*affLen)];
        }
        if (Math.random() > .33) {
            var chestOpts = [1, 8];
            eq.chest = [Math.floor(Math.random()*affLen), chestOpts[Math.floor(Math.random() * chestOpts.length)], Math.floor(Math.random()*affLen)];
        }
        if (Math.random() > .33) {
            var handOpts = [3, 42];
            eq.hands = [Math.floor(Math.random()*affLen), handOpts[Math.floor(Math.random() * handOpts.length)], Math.floor(Math.random()*affLen)];
        }
        if (Math.random() > .33) {
            eq.legs = [Math.floor(Math.random()*affLen), 2, Math.floor(Math.random()*affLen)];
        }
        if (Math.random() > .33) {
            eq.feet = [Math.floor(Math.random()*affLen), 4, Math.floor(Math.random()*affLen)];
        }
    }
    return eq;
    //return initial armor/weaps for this prof.
};
