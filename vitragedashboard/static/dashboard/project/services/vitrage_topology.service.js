(function() {
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
    return {
      getTopology: function getTopology() {

        if (vitrageAPI) {
          return vitrageAPI.getTopology()
            .success(function(data) {
              console.log("Success ", data);
              return data;
            })
            .error(function(err) {
                console.error(err);
              }
            )
        }
      }
    }
  }
})();
