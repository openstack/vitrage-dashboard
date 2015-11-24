/**
 * Created by oetrog on 11/17/15.
 */

(function(){
'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .controller('vitrageTopologyCtrl',VitrageTopologyCtrl);

        VitrageTopologyCtrl.$inject = ['$scope','vitrageTopologySrv'];

        function VitrageTopologyCtrl($scope,vitrageTopologySrv){
            $scope.STATIC_URL = STATIC_URL;
            var srv = vitrageTopologySrv;
        }

})();
