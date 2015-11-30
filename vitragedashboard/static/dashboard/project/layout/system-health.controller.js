(function () {
    'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .controller('SystemHealthController', SystemHealthController);

    SystemHealthController.$inject = ['$scope', 'vitrageTopologySrv'];

    function SystemHealthController($scope, vitrageTopologySrv) {
        $scope.STATIC_URL = STATIC_URL;
        var srv = vitrageTopologySrv;
    }

})();
