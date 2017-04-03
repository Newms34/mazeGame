app.factory('musFac', function($http) {
    var themes = {
        battle: [],
        defeat: [],
        victory: [],
        intro: [],
        general: []
    }
    return {
    	createMus:function(){
    		//done once each page load to generate the audiocontext
    		window.AudioContext = window.AudioContext || window.webkitAudioContext;
            window.context = new AudioContext();
            window.gain = context.createGain();
            gain.gain.value = 0.5;
    	},
        getMusic: function(mode) {
            //get a random musical selection from a particular category
            if (window.context && window.source){
            	window.source.stop();
            }
            function process(Data) {
                window.source = window.context.createBufferSource(); // Create Sound Source
                window.context.decodeAudioData(Data, function(buffer) {
                    window.source.buffer = buffer;
                    window.source.connect(gain);
                    window.gain.connect(context.destination);
                    window.source.start(context.currentTime);
                })
            }
            var request = new XMLHttpRequest();
            request.open("GET", "./other/mus/" + mode, true);
            request.responseType = "arraybuffer";
            request.onload = function() {
                var Data = request.response;
                process(Data);
            };
            request.send();
        },
        toggleMus: function(){
        	if (window.gain && window.gain.gain.value && window.gain.gain.value>0 ){
        		//mute
        		window.gain.gain.value=0;
        	}else if (window.gain && window.gain.gain.value==0 ){
        		window.gain.gain.value=.5;
        	}
        }
    }
})
