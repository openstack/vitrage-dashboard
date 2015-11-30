(function(){
'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .service('vitrageTopologySrv',VitrageTopologySrv);

        VitrageTopologySrv.$inject = ['$http','$injector'];

        function VitrageTopologySrv($http,$injector){
                var vitrageAPI;
                console.log("vitrageTopologySrv");
                if ($injector.has('horizon.app.core.openstack-service-api.vitrage')) {
                    vitrageAPI = $injector.get('horizon.app.core.openstack-service-api.vitrage');
                    console.log("vitrageAPI "+vitrageAPI.toString());
                    if (vitrageAPI) {
                        vitrageAPI.getTopology()
                            .success(function (data) {
                                console.log("Success " + data);
                            })
                            .error(function (err) {
                                    console.error(err);
                                }
                            )
                    }
                }
        }

})();
