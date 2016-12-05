(function(){
	'use strict';
	
	angular.module("app")
	.run(runBlock);
	function runBlock($log, $rootScope) {
		$log.debug('Iniciado');
		$rootScope.keys = Object.keys;
		$rootScope.safeApply = function(fn) {
			var phase = this.$root.$$phase;
			if(phase == '$apply' || phase == '$digest') {
				if(fn && (typeof(fn) === 'function')) {
					fn();
				}
			} else {
				this.$apply(fn);
			}
		};
	}
})();