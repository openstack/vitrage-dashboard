
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

    return {
      getTopology: getTopology
    };

    ///////////

    // Topology
    function getTopology() {
      console.log("****   getToplogy test ****");
      return apiService.get('/api/nova/keypairs/')
        .error(function () {
          toastService.add('error', gettext('Unable to get the Vitrage service Topology.'));
        });

    }


  }

}());
