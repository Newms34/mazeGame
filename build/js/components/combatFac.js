app.factory('combatFac', function($http) {
    var dmgTypes = ['Physical', 'Fire', 'Ice', 'Poison', 'Dark', 'Holy'];
    return {
        getDmgType: function(typeNum) {
            return dmgTypes[parseInt(typeNum)];
        },
        combatReady: function() {
            //just set up the health/energy bars
            $('#combat-box #enemy .health-bar .stat-bar-stat').css('width', '100%');
            $('#combat-box #player .health-bar .stat-bar-stat').css('width', '100%');
            $('#combat-box #player .energy-bar .stat-bar-stat').css('width', '100%');
        },
        getSkillInf: function(all, n) {
            bootbox.dialog({
                message: all[n].desc,
                title: all[n].name,
                buttons: {
                    main: {
                        label: "Okay",
                        className: "btn-primary"
                    }
                }
            })
        },
        updateBars: function(pm, pc, pem, pec, mm, mc) {
            pm = parseInt(pm);
            pc = parseInt(pc);
            pem = parseInt(pem);
            pec = parseInt(pec);
            mm = parseInt(mm);
            mc = parseInt(mc);
            var phperc = parseInt(100 * pc / pm);
            var penperc = parseInt(100 * pec / pem);
            var mhperc = parseInt(100 * mc / mm);
            console.log(mhperc, phperc, penperc)
            $('#combat-box #enemy .health-bar .stat-bar-stat').css('width', mhperc + '%');
            $('#combat-box #player .health-bar .stat-bar-stat').css('width', phperc + '%');
            $('#combat-box #player .energy-bar .stat-bar-stat').css('width', penperc + '%');
        }
    };
});
