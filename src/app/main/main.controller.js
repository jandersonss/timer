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

	function MainController($rootScope,
			$scope,
			$window, 
			$localStorage, 
			$timeout, 
			$log ,
			toastr, 
			MainService,
			$uibModal){

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
		vm.regex = /^[0-9]{1,7}(\.[0-9]+)?$/;
		vm.cargaHoraria = 8.5;
		vm.tarefa = {};
		vm.listaTarefas = [];
		vm.listaOciosidade = {};
		vm.startPause = startPause;
		vm.finalizar = finalizar;
		vm.getOciosidade = getOciosidade;
		vm.removeTarefa = removeTarefa;
		vm.geraListaOciosidade = geraListaOciosidade;
		vm.alterarData = alterarData;


		var tableToExcel = (function () {
	        var uri = 'data:application/vnd.ms-excel;base64,'
	        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
	        , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
	        , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
	        , getHtmlTabela = function (table){
				var tab = $(table).clone();
				tab.find('button.btn-danger').parent().text('');
				tab.find('button').remove();
				tab.find("tr").map(function(i, val){
					$(val).find('>td:eq(0):empty,>th:eq(0):empty').remove();
				});
				return tab.html();
			};
	        return function (table, name, filename) {
	            if (!table.nodeType) table = document.getElementById(table)
	            var ctx = { worksheet: name || 'Worksheet', table: getHtmlTabela(table) }

	            document.getElementById("dlink").href = uri + base64(format(template, ctx));
	            document.getElementById("dlink").download = filename;
	            document.getElementById("dlink").click();

	        }
	    })();

		vm.export = function(){
			var hoje = moment().format('DD-MM-YYYY');
			tableToExcel('table-tarefas','Tarefas','Tarefas-'+hoje+'.xls');
		};
		
		vm.vw = $window.innerWidth;

		$(window).on("resize.doResize", function (){
	      $scope.$apply(function(){
	          vm.vw = $window.innerWidth;
	      });
	  	});
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
			var point = new Date()
			//Pausa
			if(vm.tarefa.running){
				vm.tarefa.points.push(point.getTime());
				cancelTimer();
				return;
			}
			//Inicia
			if(vm.tarefa.count == 0)
				vm.tarefa.inicio = point;

			vm.tarefa.points.push(point.getTime());
			onTimeout();
		}

		function finalizar(){
			$log.log($window);
			$log.log(window.t = $window.t = toastr);
			
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
			if(inList){
				vm.listaTarefas.unshift(vm.tarefa);
			}
			$localStorage.cargaHoraria = vm.cargaHoraria;
			$localStorage.tarefaAtual = vm.tarefa;
			$localStorage.listaTarefas = angular.copy(vm.listaTarefas);
			geraListaOciosidade();
		}

		function getOciosidade(item){
			var data = moment(item.data, "DD/MM/YYYY").format("DDMMYYYY");
			var now = moment().format("DDMMYYYY");
			var hours = moment.duration(Number(vm.cargaHoraria), 'hours');
			if(data === now){
				var tempo = hours.asSeconds() - (item.total+vm.tarefa.count);
				if(tempo < 0){
					item.tipoSaldo = '+';
					return tempo*-1;
				}
				item.tipoSaldo = '-';
				return tempo;
			} else {
				var tempo = hours.asSeconds() - item.total;
				if(tempo < 0){
					item.tipoSaldo = '+';
					return tempo*-1;
				}
				item.tipoSaldo = '-';
				return tempo;
			}
		}

		function geraListaOciosidade(event){
			vm.listaOciosidade = {};
			for(var i=0; i < vm.listaTarefas.length;i++){
				var tarefa = vm.listaTarefas[i];
				var data = moment(tarefa.inicio).format("DD/MM/YYYY");
				if(!vm.listaOciosidade.hasOwnProperty(data)){
					vm.listaOciosidade[data] = {
						data:data,
						total:tarefa.count
					};
				}else{
					vm.listaOciosidade[data].total += tarefa.count;
				}

			};

			$timeout(function(){
				$rootScope.safeApply();
			}, 100);
		}

		function sortList(listaTarefas){
			return listaTarefas.sort(function(a,b){
				var iniA = moment(a.inicio, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
				var iniB = moment(b.inicio, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
				return iniA.unix() < iniB.unix();
			});
		}

		function alterarData(tarefa, point){

			if('inicio|final'.indexOf(point) === -1){
				return;
			}

			var modalInstance = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'modalAlterarData.html',
				controller: 'ModalAlterarDataCtrl',
				size: 'sm',
				resolve: {
					data: function () {
						return moment(tarefa[point]);
					},
					point:function(){
						return point === 'inicio' ? 'início' : point;
					}
				}
			});


			modalInstance.result.then(function (novaData) {
				tarefa[point] = novaData.toISOString();
				
				var index = point === 'inicio' ? 0 : tarefa.points.length-1;
				
				if(tarefa.points.hasOwnProperty(index))
					tarefa.points[index] = novaData.toDate().getTime();

				tarefa.count = MainService.calculeCount(tarefa.points);
				if(!vm.tarefa.running){
					save();
					$localStorage.listaTarefas = angular.copy(vm.listaTarefas);
				}
				
				geraListaOciosidade();


			});

			
		}

		function removeTarefa(index){
			vm.listaTarefas.splice(index,1);
			$localStorage.listaTarefas = angular.copy(vm.listaTarefas);
			geraListaOciosidade();
		}
	}
})();