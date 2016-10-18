(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('TemplateContainerController', TemplateContainerController);

  TemplateContainerController.$inject = ['template', '$scope', 'vitrageTopologySrv'];

  function TemplateContainerController(template, $scope, vitrageTopologySrv) {
    var vm = this;
    $scope.STATIC_URL = STATIC_URL;
    vm.isLoading = true;

    var getData = function() {
      vm.isLoading = true;
      vitrageTopologySrv.getTemplates(template.uuid)
        .then(
          function success(result) {
            $scope.data = result.data;
          },
          function error(result) {
            console.log('Error in Template Show:', result);
          }
        )
    };

    getData();

  }

})();
