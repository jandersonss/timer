(function(){
	'use strict';

	angular.module("app")
	.service("MainService",function($q){
		var path = window.location.pathname.indexOf("timer-count") != -1 ? '/timer/' : window.location.pathname;
		var worker = new Worker(path+'app/main/doWork.js');
		
		var service = {
			onWork: null,
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