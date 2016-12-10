(function(){
	'use strict';

	Array.prototype.chunk = function (unit) {
		var results = [],
		length = Math.ceil(this.length / unit);

		for (var i = 0; i < length; i++) {
			results.push(this.slice(i * unit, (i + 1) * unit));
		}
		return results;
	};


	angular.module("app")
	.config(config)
	.constant('moment', moment);
	function config($logProvider, toastrConfig, momentPickerProvider) {
		momentPickerProvider.options({
			locale:'pt-br'
		})
	    // Enable log
	    $logProvider.debugEnabled(true);

	    angular.extend(toastrConfig, {
	    	allowHtml: false,
	    	closeButton: false,
	    	closeHtml: '<button>&times;</button>',
	    	extendedTimeOut: 1000,
	    	iconClasses: {
	    		error: 'toast-error',
	    		info: 'toast-info',
	    		success: 'toast-success',
	    		warning: 'toast-warning'
	    	},  
	    	messageClass: 'toast-message',
	    	onHidden: null,
	    	onShown: null,
	    	onTap: null,
	    	progressBar: true,
	    	tapToDismiss: true,
	    	templates: {
	    		toast: 'directives/toast/toast.html',
	    		progressbar: 'directives/progressbar/progressbar.html'
	    	},
	    	timeOut: 3000,
	    	titleClass: 'toast-title',
	    	toastClass: 'toast'
	    });
	}
})();