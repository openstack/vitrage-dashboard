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

  hzComputeController.$inject = ['$scope','vitrageTopologySrv','$location'];

  return directive;

  function link(scope, element, attrs) {
  }

  function hzComputeController($scope,vitrageTopologySrv,$location){
      var computeCtrl = this;
      computeCtrl.model = {};
      computeCtrl.model.computeTopology = [];
      computeCtrl.model.selected = {};
      var url = $location.absUrl();
      vitrageTopologySrv.getTopology(null,null,url.indexOf('admin') != -1).then(function(result){
         computeCtrl.model.computeTopology = result.data;
      });

      $scope.$on('sunburstItemClicked',function (event,data){
        event.stopPropagation();
        $scope.$digest();
      });

    }

  }

