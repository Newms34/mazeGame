var startFns = {},
profs = ['general','warrior','sorcerer','necromancer','paladin'],
mongoose = require('mongoose');
module.exports = startFns;

startFns.getSkills = function(prof){
	if(prof>=profs.length || profs<1){
		return false;
	}
	//return the initial list of skills (to be unlocked) for this profession. Since further skills are unlocked as 'branches' off of previous skills, this basically determines ALL of the skills this prof uses.
};
startFns.getEquip = function(prof){
	if(prof>=profs.length || profs<1){
		return false;
	}
	//return initial armor/weaps for this prof.

};