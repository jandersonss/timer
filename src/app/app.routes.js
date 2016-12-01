(function(){
	'use strict';

	angular.module("app")
	.config(routerConfig)
	function routerConfig($stateProvider, $urlRouterProvider) {
		var path = window.location.pathname.indexOf("timer-count") != -1 ? '/timer/' : window.location.pathname;
		$stateProvider
		.state('home', {
			url: '/',
			templateUrl: path+'app/main/main.html',
			controller: 'MainController',
			controllerAs: 'vm'
		});

		$urlRouterProvider.otherwise('/');
	}
})();