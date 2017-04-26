(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('AlarmListController', AlarmListController);

  AlarmListController.$inject = ['$scope', 'modalSrv', 'vitrageTopologySrv','$interval','$location'];

  function AlarmListController($scope, modalSrv, vitrageTopologySrv,$interval,$location) {
    var alarmList = this;
    alarmList.alarms = [];
    alarmList.ialarms = [];
    alarmList.$interval = $interval;
    alarmList.checkboxAutoRefresh = true;
    $scope.STATIC_URL = STATIC_URL;
    alarmList.alarms = [];
    alarmList.alarmInterval;

    getData();
    startCollectData();

    function startCollectData() {
      if (angular.isDefined(alarmList.alarmInterval)) return;
      alarmList.alarmInterval = alarmList.$interval(getData,10000);
    }

    function stopCollectData() {
      if (angular.isDefined(alarmList.alarmInterval)) {
        alarmList.$interval.cancel(alarmList.alarmInterval);
        alarmList.alarmInterval = undefined;
      }
    }
    $scope.$on('$destroy',function(){
      alarmList.stopCollectData();
    });

    alarmList.autoRefreshChanged = function(){
      if (alarmList.checkboxAutoRefresh){
        getData();
        startCollectData();
      }else{
        stopCollectData();
      }
    };

    function getData() {
      var url = $location.absUrl();
      vitrageTopologySrv.getAlarms('all',url.indexOf('admin') != -1).then(function(result){
          alarmList.alarms = result.data;
      })
    }


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

      modalSrv.show(modalOptions);
    }
  }

})();

