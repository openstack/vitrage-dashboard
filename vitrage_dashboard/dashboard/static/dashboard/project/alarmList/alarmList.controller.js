(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('AlarmListController', AlarmListController);

  AlarmListController.$inject = ['$scope', 'modalSrv', 'vitrageTopologySrv', 'timeSrv', '$interval', '$location'];

  function AlarmListController($scope, modalSrv, vitrageTopologySrv, timeSrv, $interval, $location) {
    var alarmList = this;
    var LIMIT = horizon.cookies.get('API_RESULT_PAGE_SIZE') || 20;
    var filterTimeout;

    alarmList.alarms = [];
    alarmList.ialarms = [];
    alarmList.filterByField = {name: 'Filter By', filterValue: null};
    alarmList.filterItems = [
      {name: 'Filter By', filterValue: null},
      {name: 'Severity', filterValue: 'vitrage_aggregated_severity'},
      {name: 'Name', filterValue: 'name'},
      {name: 'Resource Type', filterValue: 'vitrage_resource_type'},
      {name: 'Resource ID', filterValue: 'vitrage_resource_id'},
      {name: 'Alarm Type', filterValue: 'vitrage_type'}
    ];
    alarmList.filterText = '';
    alarmList.$interval = $interval;
    alarmList.checkboxAutoRefresh = true;
    $scope.STATIC_URL = STATIC_URL;
    alarmList.format = 'dd-MMMM-yyyy';
    alarmList.timezone = timeSrv.getHorizonTimezone();
    alarmList.dateFormat = timeSrv.longDateFormat;
    alarmList.dateOptions = {
      dateDisabled: false,
      formatYear: 'yy',
      maxDate: new Date(),
      startingDay: 1
    };
    alarmList.altInputFormats = ['M!/d!/yyyy'];
    alarmList.fromDateTime = new Date();
    alarmList.fromDateTime.setDate(alarmList.fromDateTime.getDate() - 30);
    alarmList.fromDateTime.setMilliseconds(0);

    alarmList.sortByFieldName = '';
    alarmList.sortOrder = '';

    alarmList.toDateTime = new Date();
    alarmList.toDateTime.setMilliseconds(0);

    alarmList.nextEnabled = false;
    alarmList.prevEnabled = false;

    alarmList.radioModel = 'activeAlarms';

    alarmList.open1 = function () {
      alarmList.popup1.opened = true;
    };

    alarmList.popup1 = {
      opened: false
    };

    alarmList.autoRefreshChanged = function () {
      if (alarmList.checkboxAutoRefresh && alarmList.radioModel !== 'historyAlarms') {
        startCollectData();
      } else {
        stopCollectData();
      }
    };


    alarmList.getHistoryData = function (nextPrev, updateDate) {
      if (nextPrev === 'next' && !alarmList.nextEnabled) {
        return;
      }
            if(updateDate=='update'){
                alarmList.toDateTime = new Date();
                alarmList.toDateTime.setMilliseconds(0);
            }

      var url = $location.absUrl();
      var config = {
        vitrage_id: 'all',
        admin: url.indexOf('admin') != -1,
        limit: LIMIT
      };

      if (alarmList.radioModel === 'historyAlarms') {
        alarmList.toDateTime = new Date();
        alarmList.toDateTime.setMilliseconds(0);
        config.start = alarmList.fromDateTime;
        config.end = alarmList.toDateTime;
      }

      if (nextPrev !== '') {
        if (nextPrev === 'next') {
          config.next_page = true;
          config.marker = alarmList.alarms.length > 0 ? alarmList.alarms[alarmList.alarms.length - 1].vitrage_id : 0;
        } else if (nextPrev === 'prev') {
          config.next_page = false;
          config.marker = alarmList.alarms.length > 0 ? alarmList.alarms[0].vitrage_id : 0;
        }
      }

      if (alarmList.sortByFieldName !== '') {
        config.sort_by = [alarmList.sortByFieldName];
        config.sort_dirs = [alarmList.sortOrder];
      }

      if (alarmList.filterByField && alarmList.filterByField.filterValue !== null && alarmList.filterText !== '') {
        config.filter_by = [alarmList.filterByField.filterValue];
        config.filter_vals = [alarmList.filterText];
      } else {
        config.filter_by = undefined;
        config.filter_vals = undefined;
      }


      if (alarmList.radioModel === 'historyAlarms') {
          $("#table").hide();
          $("#spinner").show();
          vitrageTopologySrv.getHistoryAlarms(config).then(function (result) {
          alarmList.alarms = result.data;
          $("#spinner").hide();
          $("#table").show();
          alarmList.nextEnabled = result.data.length === LIMIT;
          alarmList.prevEnabled = true;
        });
      } else {
        vitrageTopologySrv.getAlarms(config).then(function (result) {
          alarmList.alarms = result.data;

          alarmList.nextEnabled = result.data.length === LIMIT;
          alarmList.prevEnabled = true;
        });
      }

    };

    alarmList.getHistoryData();

    function startCollectData() {
      if (angular.isDefined(alarmList.alarmInterval)) return;
      alarmList.alarmInterval = alarmList.$interval(alarmList.getHistoryData,10000);
    }

    function stopCollectData() {
      if (angular.isDefined(alarmList.alarmInterval)) {
        alarmList.$interval.cancel(alarmList.alarmInterval);
        alarmList.alarmInterval = undefined;
      }
    }

    alarmList.sortBy = function (fieldName) {
      if (fieldName === alarmList.sortByFieldName) {
        alarmList.sortOrder = alarmList.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        alarmList.sortOrder = 'asc';
      }
      alarmList.sortByFieldName = fieldName;

      alarmList.getHistoryData();
    };

    alarmList.onRcaClick = function (alarm) {
      var modalOptions = {
        animation: true,
        templateUrl: STATIC_URL + 'dashboard/project/components/rca/rcaContainer.html',
        controller: 'RcaContainerController',
        windowClass: 'app-modal-window',
        resolve: {
          alarm: function () {
            return alarm;
          }
        }
      };

      modalSrv.show(modalOptions);
    };

    alarmList.onFilterChange = function() {
      clearTimeout(filterTimeout);
      var that = alarmList;

      filterTimeout = setTimeout(function() {
        that.getHistoryData('');
      }, 500);
    };

    alarmList.onFilterFieldChange = function() {
      alarmList.getHistoryData('');
    };
  }

})();

