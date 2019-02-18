angular
  .module('horizon.dashboard.project.vitrage')
  .directive('hzAlarms', hzAlarms);

function hzAlarms() {
  var directive = {
    templateUrl: STATIC_URL + 'dashboard/project/components/alarms/alarms.html',
    restrict: 'E',
    scope: {
      selected: '='
    },
    controller: AlarmsController,
    controllerAs: 'alarmsCtrl'
  };

  AlarmsController.$inject = ['$scope', 'modalSrv', 'timeSrv', 'vitrageTopologySrv'];
  return directive;

  function AlarmsController($scope, modalSrv, timeSrv, vitrageTopologySrv) {
    var alarmsCtrl = this;
    alarmsCtrl.timezone = timeSrv.getHorizonTimezone();
    alarmsCtrl.dateFormat = timeSrv.longDateFormat;

    $scope.$watch('selected', function(newData, oldData) {
      if (newData != oldData) {
        console.log('selected ', newData);
	var config = {vitrage_id: newData.vitrage_id};
        vitrageTopologySrv.getAlarms(config).then(function(result) {
          alarmsCtrl.computeAlarms = result.data;
        });
      }
    });

    alarmsCtrl.onAlarmClick = function(alarm) {
      var modalOptions = {
        animation: true,
        templateUrl: STATIC_URL + 'dashboard/project/components/rca/rcaContainer.html',
        controller: 'RcaContainerController',
        windowClass: 'app-modal-window',
        resolve: {alarm: function() {
          return alarm;
        }}
      };

      modalSrv.show(modalOptions);
    }
  }
}

