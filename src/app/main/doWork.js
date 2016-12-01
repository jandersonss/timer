var path = self.location.pathname.replace('app/main/doWork.js','').indexOf("timer-count") != -1 ? '/timer/' : self.location.pathname.replace('app/main/doWork.js','');
self.importScripts(path+'bower_components/moment/min/moment.min.js');
var timer;
var data = {
	count: 0,
	points:[],
	running:false,
	finalizar:false
};

function calculeCount(){
	var momentTotal = [0];
	var now = moment();
	if(data.points.length > 3){
		var last =  moment(data.points[data.points.length-2]);
		for(i=0; i < (data.points.length-3); i++){
			var a = moment(data.points[i]);
			var b =  moment(data.points[i+1]);
			var result = moment.duration(b.diff(a)).asSeconds();
			momentTotal.push(result);
		}
	}else{
		var last =  moment(data.points[0]);
	}
	//console.log('partial', partial.seconds());
	var sum = momentTotal.reduce(function(previousValue, currentValue, index, array){
		return previousValue+currentValue;
	});
	//console.log(momentTotal);
	var diff = now.diff(last);

	return moment.duration(diff).add(sum,'seconds').asSeconds();
}

function onInterval(){
	data.running = true;
	//data.count++;
	data.count = calculeCount();
	//timer = setInterval(onInterval,1000);
	self.postMessage(data);
}

function cancelTimer(){
	if(timer)
		clearInterval(timer);
	data.running = false;
	self.postMessage(data);
}

self.onmessage = function(e) {
	data.points = e.data.points;
	switch(e.data.acao){
		case 'start':
			data.finalizar = false;
			data.count = e.data.count;
			timer = setInterval(onInterval,1000);//onInterval();
			break;
		case 'pause': 
			cancelTimer();
			break;
		case 'finalizar':
			data.finalizar = true;
			cancelTimer();
			break;
	}	
};