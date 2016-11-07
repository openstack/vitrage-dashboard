(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('RcaContainerController', RcaContainerController);

  RcaContainerController.$inject = ['alarm', '$scope', 'modalSrv', 'vitrageTopologySrv'];

  function RcaContainerController(alarm, $scope, modalSrv, vitrageTopologySrv) {
    var vm = this;
    $scope.STATIC_URL = STATIC_URL;
    vm.isLoading = true;

    $scope.closeModal = function () {
      modalSrv.close();
    };

    var getData = function() {
      vm.isLoading = true;
      vitrageTopologySrv.getRootCauseAnalysis(alarm.vitrage_id)
        .then(
          function success(result) {
            $scope.data = result.data;
          },
          function error(result) {
            console.log('Error in RCA:', result);
          }
        )
    };

    getData();

  }

})();
