angular
  .module('horizon.dashboard.project.vitrage')
  .directive('hzCompute', hzCompute);

function hzCompute() {
  var directive = {
    link: link,
    templateUrl: STATIC_URL + 'dashboard/project/layout/main/compute/compute.html',
    restrict: 'E',
    controller: hzComputeController,
    controllerAs: 'computeCtrl'
  };

  hzComputeController.$inject = ['$scope','vitrageTopologySrv'];

  return directive;

  function link(scope, element, attrs) {
  }

  function hzComputeController($scope,vitrageTopologySrv){
      var computeCtrl = this;
      computeCtrl.model = {};
      computeCtrl.model.computeTopology = [];
      computeCtrl.model.selected = {};
      vitrageTopologySrv.getTopology().then(function(result){
         computeCtrl.model.computeTopology = result.data;
      });

      $scope.$on('sunburstItemClicked',function (event,data){
        event.stopPropagation();
        $scope.$digest();
      });

    }

  }

