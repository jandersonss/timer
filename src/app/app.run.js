(function(){
  'use strict';
  
	angular.module("app")
	.run(runBlock);
	function runBlock($log, $rootScope) {
		$log.debug('Iniciado');
    	$rootScope.keys = Object.keys;
	}
})();