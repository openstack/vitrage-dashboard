(function () {
  'use strict';

  angular
      .module('horizon.dashboard.project.vitrage')
      .controller('TemplateListController', TemplateListController);

  TemplateListController.$inject = ['$scope', 'modalSrv', 'vitrageTopologySrv'];

  function TemplateListController($scope, modalSrv, vitrageTopologySrv) {
    var templateList = this;
    templateList.templates = [];
    templateList.itemplates = [];
    $scope.STATIC_URL = STATIC_URL;
    templateList.templates = [];

    getData();

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
    }
  }

})();

