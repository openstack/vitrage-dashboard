(function () {
    'use strict';

    angular
        .module('horizon.app.core.openstack-service-api')
        .factory('horizon.app.core.openstack-service-api.vitrage', vitrageAPI);

    vitrageAPI.$inject = [
        'horizon.framework.util.http.service',
        'horizon.framework.widgets.toast.service'

    ];

    function vitrageAPI(apiService, toastService) {

        var service = {
            getTopology: getTopology,
            getAlarms: getAlarms,
            getHistoryAlarms: getHistoryAlarms,
            getRca: getRca,
            getTemplates: getTemplates,
            deleteTemplate: deleteTemplate,
            validateTemplate: validateTemplate,
            addTemplate: addTemplate
        };

        return service;

        ///////////
        // Topology
        ///////////

        function getTopology(graph_type, config, admin) {
            config = config || {};

            if (graph_type) {
                config.params = config.params || {};
                config.params.graph_type = graph_type;
            }
            if (admin) {
                (!config.params) ? config.params = {all_tenants: true} : config.params.all_tenants = true;
            }
            console.info('CONFIG in core - ', config)
            return apiService.get('/api/vitrage/topology/', config)
                .catch(function onError() {
                    toastService.add('error', gettext('Unable to fetch the Vitrage Topology service.'));
                });
        }

        function getAlarms(config) {
            config = config || {};
            var url = '/api/vitrage/alarm/';

            return apiService.get(url, config)
                .catch(function () {
                    toastService.add('error', gettext('Unable to fetch the Vitrage Alarms service.'));
                });
        }

        function getHistoryAlarms(config) {
            config = config || {};

            var url = '/api/vitrage/history/';
            return apiService.get(url, config)
                .catch(function () {
                    toastService.add('error', gettext('Unable to fetch the Vitrage'+
                        ' Alarms History service.'));
                });

        }

        function getRca(alarm_id, adminState) {
            return apiService.get('/api/vitrage/rca/'+alarm_id+"/"+adminState)
                .catch(function () {
                    toastService.add('error', gettext('Unable to fetch the Vitrage RCA service.'));
                });
        }

        function getTemplates(template_id) {
            return apiService.get('/api/vitrage/template/'+template_id)
                .catch(function () {
                    toastService.add('error', gettext('Unable to fetch the Vitrage Templates service.'));
                });
        }

        function deleteTemplate(template_id) {
            return apiService.delete('/api/vitrage/template/'+template_id)
                .catch(function () {
                    toastService.add('error', gettext('Unable to fetch the Vitrage Templates service.'));
                });
        }

        function addTemplate(template, type, parameters) {
            var temp = {'template': template, 'type': type, "params": parameters, "method": 'add'};
            return apiService.post('/api/vitrage/template/default/', temp)
                .catch(function () {
                    toastService.add('error', gettext('Unable to fetch the Vitrage Templates service.'));
                });
        }

        function validateTemplate(template, type, parameters) {
            var temp = {'template': template, 'type': type, "params": parameters, "method": 'validate'};
            return apiService.post('/api/vitrage/template/default/', temp)
                .catch(function () {
                    toastService.add('error', gettext('Unable to validate the Vitrage Templates service.'));
                });
        }

    }

}());
