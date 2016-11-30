(function(){
	'use strict';

	angular.module("app")
	.filter('formatTimer', function() {
	  return function(input)
	    {
	        function z(n) {return (n<10? '0' : '') + n;}
	        var seconds = input % 60;
	        var minutes = Math.floor(input / 60);
	        var hours = Math.floor(minutes / 60);
	        return (z(hours) +':'+z(minutes)+':'+z(seconds));
	    };
	})
	.controller('MainController', MainController);

	function MainController($scope, $localStorage, $timeout, $log){
		var vm = this;
		var timer;
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
		vm.startPause = startPause;
		vm.finalizar = finalizar;
		
		//////////////////////
		init();
		function init(){
			if($localStorage.listaTarefas){
				vm.listaTarefas = $localStorage.listaTarefas;
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

		function onTimeout(){
			vm.tarefa.running = true;
			vm.tarefa.count++;
			//$scope.$apply();
			vm.tarefa.timer = new Date(vm.tarefa.count*1000);
			timer = $timeout(onTimeout,1000);
			save();
		}

		function finalizar(){
			vm.tarefa.final = new Date();
			cancelTimer();
			save(true);
			reset();
		}

		function cancelTimer(){
			$timeout.cancel(timer);
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
	}
})();