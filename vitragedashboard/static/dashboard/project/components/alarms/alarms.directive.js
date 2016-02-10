angular
  .module('horizon.dashboard.project.vitrage')
  .directive('hzAlarms', hzAlarms);

function hzAlarms() {
  var directive = {
    link: link,
    templateUrl: STATIC_URL + 'dashboard/project/components/alarms/alarms.html',
    restrict: 'E',
    scope:{
      selected:'='
    },
    controller : AlarmsController,
    controllerAs : 'alarmsCtrl'
  };

  AlarmsController.$inject = ['$scope', 'vitrageTopologySrv'];
  return directive;

  function link(scope, element, attrs) {
  }

  function AlarmsController($scope,vitrageTopologySrv){
    var alarmsCtrl = this;
    $scope.$watch('selected', function(newData,oldData) {
      if (newData != oldData){
        console.log('selected ',newData);
        vitrageTopologySrv.getAlarms(newData.vitrage_id).then(function(result){
          alarmsCtrl.computeAlarms = result.data;
        });
      }
    });
  }
}
