(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('AlarmListController', AlarmListController);

  AlarmListController.$inject = ['$scope', '$modal', 'vitrageTopologySrv'];

  function AlarmListController($scope, $modal, vitrageTopologySrv) {
    var alarmList = this;
    alarmList.alarms = [];
    alarmList.ialarms = [];
    $scope.STATIC_URL = STATIC_URL;
    alarmList.alarms = [];
    vitrageTopologySrv.getAlarms('all').then(function(result){
      alarmList.alarms = result.data;
    });

    alarmList.onRcaClick = function(alarm) {
      var modalOptions = {
        animation: true,
        templateUrl: STATIC_URL + 'dashboard/project/components/rca/rcaContainer.html',
        controller: 'RcaContainerController',
        windowClass: 'app-modal-window',
        resolve: {alarm: function() {
          return alarm;
        }}
      };

      $modal.open(modalOptions);
    }
  }

})();

