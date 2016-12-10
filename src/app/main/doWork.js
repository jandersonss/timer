Array.prototype.chunk = function (unit) {
	var results = [],
	length = Math.ceil(this.length / unit);

	for (var i = 0; i < length; i++) {
		results.push(this.slice(i * unit, (i + 1) * unit));
	}
	return results;
}


var path = self.location.pathname.replace('app/main/doWork.js','').indexOf("timer-count") != -1 ? '/timer/' : self.location.pathname.replace('app/main/doWork.js','');
self.importScripts(path+'bower_components/moment/min/moment.min.js');
var timer;
var data = {
	count: 0,
	points:[],
	running:false,
	finalizar:false
};


function calculeCount(points){
	var momentTotal = [0];
	var pares = points.chunk(2);
	var last;
	
	for(i=0; i < pares.length; i++){
		if(pares[i].length == 2){
			var a = moment(pares[i][0]);
			var b =  moment(pares[i][1]);
			var result = moment.duration(b.diff(a)).asSeconds();
			momentTotal.push(result);
		}
	}
	if(points.length%2 != 0){
		last =  moment(pares[pares.length-1][0]);
	}

	//console.log('partial', partial.seconds());
	var sum = momentTotal.reduce(function(previousValue, currentValue, index, array){
		return previousValue+currentValue;
	});
	var now = moment();
	var diff = now.diff(last);

	var result = moment.duration(diff).add(sum,'seconds').asSeconds();

	return result;
}

function onInterval(){
	data.running = true;
	//data.count++;
	data.count = calculeCount(data.points);
	//timer = setInterval(onInterval,1000);
	self.postMessage(data);
}

function cancelTimer(){
	if(timer)
		clearInterval(timer);
	data.count = calculeCount(data.points);
	data.running = false;
	self.postMessage(data);
}

self.onmessage = function(e) {
	data.points = e.data.points;
	switch(e.data.acao){
		case 'calculeCount':
			calculeCount(e.data.points, true);
			break;
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