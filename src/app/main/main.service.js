(function(){
	'use strict';

	angular.module("app")
	.service("MainService",function($q){
		var path = window.location.pathname.indexOf("timer-count") != -1 ? '/timer/' : window.location.pathname;
		var worker = new Worker(path+'app/main/doWork.js');
		
		var service = {
			onWork: null,
			calculeCount : function (points){
				var momentTotal = [0];
				var pares = points.chunk(2);
				var last;
				
				for(var i=0; i < pares.length; i++){
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
			},
			setOnWork:function(callback){
				this.onWork = callback;
			},
			worker:worker,
			doWork : function(myData){
				defer = $q.defer();
	            worker.postMessage(myData); // Send data to our worker. 
	            return defer.promise;
	        }
	    };

	    var defer = $q.defer();
		worker.addEventListener('message', function(e) {
			if(service.onWork !== null){
				service.onWork(e.data);
			}
			defer.resolve(e.data);
		}, false);

	    return service;
	});
})();