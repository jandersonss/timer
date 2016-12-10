(function(){
	'use strict';

	angular.module("app")
	.controller('ModalAlterarDataCtrl', function ($scope, $uibModalInstance, data, point) {

		$scope.data = data;
		$scope.point = point;
		$scope.novaData = data;
		$scope.now = moment();

		$scope.ok = function () {
			$uibModalInstance.close($scope.novaData);
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
	});

})();