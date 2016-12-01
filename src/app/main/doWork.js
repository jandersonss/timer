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
	var momentTotal = null;
	var now = moment();
	var partial = data.points.reduce(function(previousValue, currentValue, index, array){
		var a = moment.duration(currentValue).seconds();
		var b =  index == 0 ? moment(previousValue).seconds() : previousValue;
		return a+b;
	});

	var sum = moment(partial);

	return moment.duration(now.diff(sum)).asSeconds();
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
			//data.count = e.data.count;
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