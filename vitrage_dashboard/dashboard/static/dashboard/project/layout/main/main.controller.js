(function () {
    'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .controller('MainController', MainController);

    MainController.$inject = ['$scope', 'vitrageTopologySrv'];

    function MainController($scope, vitrageTopologySrv) {
        $scope.STATIC_URL = STATIC_URL;
    }

})();
