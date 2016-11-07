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

  AlarmsController.$inject = ['$scope', 'modalSrv', 'vitrageTopologySrv'];
  return directive;

  function AlarmsController($scope, modalSrv, vitrageTopologySrv) {
    var alarmsCtrl = this;

    $scope.$watch('selected', function(newData, oldData) {
      if (newData != oldData) {
        console.log('selected ', newData);
        vitrageTopologySrv.getAlarms(newData.vitrage_id).then(function(result) {
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

