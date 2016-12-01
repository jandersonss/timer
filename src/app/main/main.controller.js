(function(){
	'use strict';

	angular.module("app")
	.filter('formatTimer', function() {
	  return function(input)
	    {
	        return moment("2016-01-01").startOf('day')
		    .seconds(input)
		    .format('HH:mm:ss');
	    };
	})
	.directive('onLongPress', function($timeout) {
		return {
			restrict: 'A',
			link: function($scope, $elm, $attrs) {
				$elm.bind('mousedown', function(evt) {
					// Locally scoped variable that will keep track of the long press
					$scope.longPress = true;

					// We'll set a timeout for 600 ms for a long press
					$timeout(function() {
						if ($scope.longPress) {
							// If the touchend event hasn't fired,
							// apply the function given in on the element's on-long-press attribute
							$scope.$apply(function() {
								$scope.$eval($attrs.onLongPress)
							});
						}
					}, 600);
				});

				$elm.bind('mouseup', function(evt) {
					// Prevent the onLongPress event from firing
					$scope.longPress = false;
					// If there is an on-touch-end function attached to this element, apply it
					if ($attrs.onTouchEnd) {
						$scope.$apply(function() {
							$scope.$eval($attrs.onTouchEnd)
						});
					}
				});
			}
		};
	})
	.controller('MainController', MainController);

	function MainController($scope, $localStorage, $timeout, $log ,toastr, MainService){
		var vm = this;
		var modelTarefa = {
			descricao:'',
			count:0,
			points:[],
			timer:null,
			running:false,
			inicio:null,
			final:null
		};
		vm.tarefa = {};
		vm.listaTarefas = [];
		vm.listaOciosidade = {};
		vm.startPause = startPause;
		vm.finalizar = finalizar;
		vm.getOciosidade = getOciosidade;
		vm.removeTarefa = removeTarefa;

		//////////////////////
		init();
		function init(){
			MainService.setOnWork(onWork);
			if($localStorage.listaTarefas){
				vm.listaTarefas = sortList($localStorage.listaTarefas);
				geraListaOciosidade();
			}
			if($localStorage.tarefaAtual){
				vm.tarefa = $localStorage.tarefaAtual;
				if(!vm.tarefa.points){
					vm.tarefa.points = [];
				}
			}else{
				vm.tarefa = angular.copy(modelTarefa);
				reset()
				save();
			}
			if(vm.tarefa.running){
				onTimeout();
			}

		}

		function reset(){
			vm.tarefa = angular.copy(modelTarefa);
			save();
		}

		function startPause(){
			//Pausa
			if(vm.tarefa.running){
				vm.tarefa.points.push((new Date()).getTime());
				cancelTimer();
				return;
			}
			//Inicia
			if(vm.tarefa.count == 0)
				vm.tarefa.inicio = new Date();

			vm.tarefa.points.push((new Date()).getTime());
			onTimeout();
		}

		function finalizar(){
			if(vm.tarefa.count == 0){
				toastr.error("Tarefa não iniciada.", 'Ops!');
				return;
			}else if(vm.tarefa.descricao == ''){
				toastr.error("Informe a descricao da tarefa.", 'Ops!');
				return;
			}
			vm.tarefa.final = new Date();
			vm.tarefa.points.push((new Date()).getTime());
			cancelTimer(true);
			save(true);
			reset();
		
		}
		function onWork (dados){
			if(dados.running){
				vm.tarefa = angular.extend({}, vm.tarefa, dados);
				save();
			}

			if(dados.finalizar){
				reset();
			}
			$scope.$apply();
		}

		function startWorker(){
			MainService.doWork(angular.extend({}, vm.tarefa, {
				acao: 'start'
			}));
		}

		function onTimeout(){
			vm.tarefa.running = true;
			//vm.tarefa.count++;
			//$scope.$apply();
			startWorker();

			save();
		}

		function cancelTimer(finaliza){
			vm.tarefa.running = false;
			MainService.doWork(angular.extend({}, vm.tarefa, {
				acao: finaliza ? 'finalizar' : 'pause',
			}));
			save();
		}

		function save(inList){
			$localStorage.tarefaAtual = vm.tarefa;
			if(inList){
				vm.listaTarefas.push(vm.tarefa);
				$localStorage.listaTarefas = angular.copy(vm.listaTarefas);
				geraListaOciosidade();
			}
		}

		function getOciosidade(count){
			var hours = moment.duration(8.5, 'hours');
			return hours.asSeconds() - count;
		}

		function geraListaOciosidade(){
			vm.listaTarefas.forEach(function(tarefa, i){
				var data = moment(tarefa.inicio).format("DD/MM/YYYY");
				if(!vm.listaOciosidade.hasOwnProperty(data)){
					vm.listaOciosidade[data] = {
						data:data,
						total:tarefa.count
					};
				}else{
					vm.listaOciosidade[data].total += tarefa.count;
				}
			});
		}

		function sortList(listaTarefas){
			return listaTarefas.sort(function(a,b){
				return (new Date(a.inicio)).getTime() < (new Date(b.inicio)).getTime();
			});
		}

		function removeTarefa(index){
			vm.listaTarefas.splice(index,1);
			geraListaOciosidade();
		}
	}
})();