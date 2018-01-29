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

    function getTopology(graph_type, config,admin) {
      config = config || {};

      if (graph_type) {
        config.params = config.params || {};
        config.params.graph_type = graph_type;
      }
      if (admin){
        (!config.params) ? config.params = {all_tenants: true} : config.params.all_tenants = true;
      }
      console.info('CONFIG in core - ', config)
      return apiService.get('/api/vitrage/topology/', config)
          .catch(function () {
            toastService.add('error', gettext('Unable to fetch the Vitrage Topology service.'));
          });
    }

    function getAlarms(vitrage_id,adminState) {
      if (vitrage_id == undefined){
        vitrage_id = 'all';
      }
      var url = '/api/vitrage/alarm/' + vitrage_id;
      if (adminState) {
        url += '/true';
      }else {
        url += '/false';
      }
      return apiService.get(url)
        .catch(function() {
          toastService.add('error', gettext('Unable to fetch the Vitrage Alarms service.'));
        });

    }

    function getRca(alarm_id,adminState) {
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

  }

}());
