var startFns = {},
profs = ['general','warrior','sorcerer','necromancer','paladin'],
mongoose = require('mongoose');
module.exports = startFns;

startFns.getSkills = function(prof){
	if(prof>=profs.length || profs<1){
		return false;
	}
	var retSkills = [0]
	switch(prof){
		case 1:
			//Warrior
			retSkills = retSkills.concat([2])
			break;
		case 2: 
			//Sorc
			retSkills = retSkills.concat([8,13])
			break;
		case 3:
			//Paly
			retSkills = retSkills.concat([23,24])
			break;
		default:
			retSkills = retSkills.concat([16])
			//necro

	}
	return retSkills;
	//return the initial list of skills (to be unlocked) for this profession. Since further skills are unlocked as 'branches' off of previous skills, this basically determines ALL of the skills this prof uses.
};
startFns.getEquip = function(prof){
	if(prof>=profs.length || profs<1){
		return false;
	}else{
		//here, we'll wanna randomly equip lvl 1 armor on the user. User will NOT get a full set, but approximately 50% of the armor. 
		//heavy: 25 head, 36 pants, 37 chest, 39 boots, 41 gloves
		//light: 0 head, 1/8 chest, 2 pants, 3/42 gloves, 4 boots
	}
	//return initial armor/weaps for this prof.
};