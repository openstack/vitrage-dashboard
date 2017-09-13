(function () {
    'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .service('vitrageTopologySrv', VitrageTopologySrv);

    VitrageTopologySrv.$inject = ['$http', '$injector'];

    function VitrageTopologySrv($http, $injector) {
        var vitrageAPI;

        if ($injector.has('horizon.app.core.openstack-service-api.vitrage')) {
            vitrageAPI = $injector.get('horizon.app.core.openstack-service-api.vitrage');

        }

        function getTopology(graph_type, config, admin) {

            if (vitrageAPI) {
                return vitrageAPI.getTopology(graph_type, config, admin)
                    .success(function (data) {
                        return data;
                    })
                    .error(function (err) {
                            console.error(err);
                        }
                    );
            }
        }

        function getAlarms(vitrage_id, admin) {

            if (vitrageAPI) {
                return vitrageAPI.getAlarms(vitrage_id, admin)
                    .success(function (data) {
                        return data;
                    })
                    .error(function (err) {
                            console.error(err);
                        }
                    );
            }
        }

        function getTemplates(template_id) {

            if (vitrageAPI) {
                return vitrageAPI.getTemplates(template_id)
                    .success(function (data) {
                        return data;
                    })
                    .error(function (err) {
                            console.error(err);
                        }
                    );
            }
        }


        function getRootCauseAnalysis(alarm_id, adminState) {
            if (vitrageAPI) {
                return vitrageAPI.getRca(alarm_id, adminState)
                    .success(function (data) {
                        return data;
                    })
                    .error(function (err) {
                            console.error(err);
                        }
                    );
            }
        }

        return {
            getTopology: getTopology,
            getAlarms: getAlarms,
            getRootCauseAnalysis: getRootCauseAnalysis,
            getTemplates: getTemplates
        };
    }
})();
