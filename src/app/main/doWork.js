var timer;
var data = {
	count: 0,
	running:false,
	finalizar:false
};

function onTimeout(){
	data.running = true;
	data.count++;
	timer = setTimeout(onTimeout,1000);
	self.postMessage(data);
}

function cancelTimer(){
	if(timer)
		clearInterval(timer);
	data.running = false;
	self.postMessage(data);
}

self.onmessage = function(e) {
	switch(e.data.acao){
		case 'start':
			data.finalizar = false;
			data.count = e.data.count;
			onTimeout();
			break;
		case 'stop': 
			cancelTimer();
			break;
		case 'finalizar':
			data.finalizar = true;
			cancelTimer();
			break;
	}	
};