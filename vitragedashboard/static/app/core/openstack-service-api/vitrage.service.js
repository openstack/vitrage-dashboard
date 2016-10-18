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
      getRca: getRca,
      getTemplates: getTemplates
    };

    return service;

    ///////////
    // Topology
    '/static/dashboard/project/topology/graph.sample.json'

    function getTopology(graph_type, config) {
      config = config || {};

      if (graph_type) {
        config.params = {graph_type: graph_type};
      }

      return apiService.get('/api/vitrage/topology/', config)
          .error(function () {
            toastService.add('error', gettext('Unable to fetch the Vitrage Topology service.'));
          });
    }

    function getAlarms(vitrage_id) {
      if (vitrage_id == undefined){
        vitrage_id = 'all';
      }
      return apiService.get('/api/vitrage/alarm/'+vitrage_id)
          .error(function () {
            toastService.add('error', gettext('Unable to fetch the Vitrage Alarms service.'));
          });
    }

    function getRca(alarm_id) {
      return apiService.get('/api/vitrage/rca/'+alarm_id)
          .error(function () {
            toastService.add('error', gettext('Unable to fetch the Vitrage RCA service.'));
          });
    }

    function getTemplates(template_id) {
      return apiService.get('/api/vitrage/template/'+template_id)
          .error(function () {
            toastService.add('error', gettext('Unable to fetch the Vitrage Templates service.'));
          });
    }

  }

}());
