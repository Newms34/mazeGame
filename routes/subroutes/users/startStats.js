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
	}
	//return initial armor/weaps for this prof.

};