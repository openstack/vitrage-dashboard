(function () {
  'use strict';

  angular
      .module('horizon.dashboard.project.vitrage')
      .controller('TemplateListController', TemplateListController);

  TemplateListController.$inject = ['$scope', '$interval', 'modalSrv', 'timeSrv', 'vitrageTopologySrv'];

  function TemplateListController($scope, $interval, modalSrv, timeSrv, vitrageTopologySrv)
   {
    var templateList = this;
    templateList.templates = [];
    templateList.itemplates = [];
    $scope.STATIC_URL = STATIC_URL;
    templateList.templates = [];
    templateList.$interval = $interval;
    templateList.checkboxAutoRefresh = true;
    templateList.templateInterval;
    templateList.timezone = timeSrv.getHorizonTimezone();
    templateList.dateFormat = timeSrv.longDateFormat;

    getData();
    startCollectData();

    function startCollectData() {
      if (angular.isDefined(templateList.templateInterval)) return;
      templateList.templateInterval = templateList.$interval(getData,5000);
    }

    function stopCollectData() {
      if (angular.isDefined(templateList.templateInterval)) {
        templateList.$interval.cancel(templateList.templateInterval);
        templateList.templateInterval = undefined;
      }
    }
    $scope.$on('$destroy',function(){
      templateList.stopCollectData();
    });

    templateList.autoRefreshChanged = function(){
      if (templateList.checkboxAutoRefresh){
        getData();
        startCollectData();
      }else{
        stopCollectData();
      }
    };

    templateList.refreshTemplates = function() {
        getData();
    }

    templateList.closeModal = function() {
        if(templateList.file){
            delete templateList.file.name;
        }
        modalSrv.dismiss();
    }

    templateList.submitModal = function() {
        modalSrv.close();
    }

    templateList.uploadFile = function(file, errFile) {
      if (file) {
        var ending = file.name.split('.').pop();
        if(ending !== 'yml' && ending !== 'yaml') {
            horizon.toast.add("error", gettext("Invalid file type. Templates should be YAML files"));
            delete file.name;
            return;
        }

        var modalOptions = {
          animation: true,
          templateUrl: STATIC_URL + 'dashboard/project/components/templateAdd/templateAddOptions.html',
          controller: 'TemplateListController',
          controllerAs: 'templateList',
          windowClass: 'modal-dialog-metadata',
          resolve: {file: function() {
            return file;
          }}
        };
        templateList.file = file;
        modalSrv.show(modalOptions).result.then(() => templateList.chooseType())
      }
    }

    templateList.chooseType = function() {
        var e = document.getElementById("typeSelect");
        var type = e.options[e.selectedIndex].text.toLowerCase();
        var file = templateList.file;
        templateList.type = type;
        if (type !== "standard" && type !== "definition" && type !== "equivalence") {
            horizon.toast.add("error", gettext("Invalid type entered. Type is one of: standard, definition, equivalence"));
            delete file.name;
            return;
        }
        var r = new FileReader();
        r.onload = function(e) {
            var content = e.target.result;
            vitrageTopologySrv.addTemplate(content, type).then(function(result){
                getData();
            })
            .catch(function(){
                horizon.toast.add("error",gettext("Unable to add template"));
                return;
            });
          }
        r.catch = function() {
            horizon.toast.add("error",gettext("Unable to read file"));
            delete file.name;
        }
        try{
            r.readAsText(file);
        }
        catch(error){
            horizon.toast.add("error",gettext("Unable to read file"));
            delete file.name;
            return;
        }
      }



    function getData() {
      vitrageTopologySrv.getTemplates('all').then(function(result){
        templateList.templates = result.data;
      });

      templateList.onShowClick = function(template) {
        var modalOptions = {
          animation: true,
          templateUrl: STATIC_URL + 'dashboard/project/components/template/templateContainer.html',
          controller: 'TemplateContainerController',
          windowClass: 'app-modal-window',
          resolve: {template: function() {
            return template;
          }}
        };

        modalSrv.show(modalOptions);
      }

      templateList.onDeleteClick = function(template) {
        vitrageTopologySrv.deleteTemplate(template.uuid).then(function(result){
         getData();
        })
        .catch(function(){
            horizon.toast.add("error", gettext("Unable to delete template"));
        });
      }
    }
  }

})();

