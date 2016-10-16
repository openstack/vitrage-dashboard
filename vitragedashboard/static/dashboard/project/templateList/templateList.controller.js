(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('TemplateListController', TemplateListController);

  TemplateListController.$inject = ['$scope', '$modal', 'vitrageTopologySrv','$interval'];

  function TemplateListController($scope, $modal, vitrageTopologySrv,$interval) {
    var templateList = this;
    templateList.templates = [];
    templateList.itemplates = [];
    templateList.$interval = $interval;
    templateList.checkboxAutoRefresh = true;
    $scope.STATIC_URL = STATIC_URL;
    templateList.templates = [];
    templateList.templateInterval;

    getData();
    startCollectData();

    function startCollectData() {
      if (angular.isDefined(templateList.templateInterval)) return;
      templateList.templateInterval = templateList.$interval(getData,10000);
    }

    function stopCollectData() {
      if (angular.isDefined(templateList.templateInterval)) {
        templateList.$interval.cancel(templateList.templateInterval);
        templateList.templateInterval = undefined;
      }
    }
    $scope.$on('$destroy',function(){
      templateList.stopCollectData();
    })

    templateList.autoRefreshChanged = function(){
      if (templateList.checkboxAutoRefresh){
        getData();
        startCollectData();
      }else{
        stopCollectData();
      }
    }

    function getData() {
      vitrageTopologySrv.getTemplates().then(function(result){
        templateList.templates = result.data;
      });
    }
  }

})();

