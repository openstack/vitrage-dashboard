(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('TemplateContainerController', TemplateContainerController);

  TemplateContainerController.$inject = ['$scope', 'modalSrv', 'vitrageTopologySrv', 'template'];

  function TemplateContainerController($scope, modalSrv, vitrageTopologySrv, template) {
    var vm = this;
    $scope.STATIC_URL = STATIC_URL;
    vm.isLoading = true;

    var getData = function() {
      vm.isLoading = true;

      $scope.closeModal = function () {
          modalSrv.close();
      };

      vitrageTopologySrv.getTemplates(template.uuid)
        .then(
          function success(result) {
            $scope.yaml_view = false;
            $scope.data = result.data;
            $scope.str_data = JSON.stringify(result.data, null, 4);
          },
          function error(result) {
            console.error('Error in Template Show:', result);
          }
        )
    };

    getData();

  }

})();
