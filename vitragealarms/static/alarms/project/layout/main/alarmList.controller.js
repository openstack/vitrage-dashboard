(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('AlarmListController', AlarmListController);

  AlarmListController.$inject = ['$scope', 'vitrageTopologySrv'];

  function AlarmListController($scope, vitrageTopologySrv) {
    var alarmList = this;
    alarmList.alarms = [];
    alarmList.ialarms = [];
    $scope.STATIC_URL = STATIC_URL;
    alarmList.alarms = [];
    vitrageTopologySrv.getAlarms('all').then(function(result){
      alarmList.alarms = result.data;
    });
  }

})();

