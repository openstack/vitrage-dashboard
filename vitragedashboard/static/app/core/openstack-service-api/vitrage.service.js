
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
      getTopology: getTopology
    };

    return service;

    ///////////
    // Topology
    function getTopology(config) {
      return apiService.get('/api/vitrage/topology', config)
        .error(function () {
          toastService.add('error', gettext('Unable to fetch the Vitrage Topology service.'));
        });
    }

  }

}());