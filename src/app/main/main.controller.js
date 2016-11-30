(function(){
	'use strict';

	angular.module("app")
	.filter('formatTimer', function() {
	  return function(input)
	    {
	        function z(n) {return (n<10? '0' : '') + n;}
	        var seconds = (input%3600)%60;
	        var minutes = Math.floor((input%3600)/60);
	        var hours = Math.floor(minutes / 60);
	        return (z(hours) +':'+z(minutes)+':'+z(seconds));
	    };
	})
	.controller('MainController', MainController);

	function MainController($scope, $localStorage, $timeout, $log ,toastr, MainService){
		var vm = this;
		var modelTarefa = {
			descricao:'',
			count:0,
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

		//////////////////////
		init();
		function init(){
			MainService.setOnWork(onWork);
			if($localStorage.listaTarefas){
				vm.listaTarefas = $localStorage.listaTarefas;
				geraListaOciosidade();
			}
			if($localStorage.tarefaAtual){
				vm.tarefa = $localStorage.tarefaAtual;
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
				cancelTimer();
				return;
			}
			//Inicia
			vm.tarefa.inicio = new Date();
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
			cancelTimer(true);
			save(true);
			reset();
		
		}
		function onWork (dados){
			if(dados.running){
				vm.tarefa = angular.extend({}, vm.tarefa, dados);
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
			vm.tarefa.count++;
			//$scope.$apply();
			startWorker();

			save();
		}

		function cancelTimer(finaliza){
			MainService.doWork({
				acao: 'finalizar',
			});
			vm.tarefa.running = false;
			save();
		}

		function save(inList){
			$localStorage.tarefaAtual = vm.tarefa;
			if(inList){
				vm.listaTarefas.push(vm.tarefa);
				$localStorage.listaTarefas = vm.listaTarefas;
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
	}
})();