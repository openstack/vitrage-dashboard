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
          .then(function (data) {
            return data;
          })
          .catch(function (err) {
              console.error(err);
            }
          );
      }
    }

    function getAlarms(config) {

      config = {params: config};

      if (vitrageAPI) {
        return vitrageAPI.getAlarms(config)
          .then(function (data) {
            return data;
          })
          .catch(function (err) {
              console.error(err);
            }
          );
      }
    }

    function getHistoryAlarms(config) {

      config = {params: config};

      if (vitrageAPI) {
        return vitrageAPI.getHistoryAlarms(config)
          .then(function (data) {
            return data;
          })
          .catch(function (err) {
              console.error(err);
            }
          );
      }
    }

    function getTemplates(template_id) {

      if (vitrageAPI) {
        return vitrageAPI.getTemplates(template_id)
          .then(function (data) {
            return data;
          })
          .catch(function (err) {
              console.error(err);
            }
          );
      }
    }

        function deleteTemplate(template_id) {

            if (vitrageAPI) {
                return vitrageAPI.deleteTemplate(template_id)
                    .then(function (data) {
                        return data;
                    })
                    .catch(function (err) {
                            console.error(err);
                        }
                    );
            }
        }

        function addTemplate(template, type, parameters) {

            if (vitrageAPI) {
                return vitrageAPI.addTemplate(template, type, parameters)
                    .then(function (data) {
                        return data;
                    })
                    .catch(function (err) {
                            console.error(err);
                        }
                    );
            }
        }
      function validateTemplate(template, type, parameters) {

          if (vitrageAPI) {
              return vitrageAPI.validateTemplate(template, type, parameters)
                  .then(function (data) {
                      return data;
                  })
                  .catch(function (err) {
                          console.error(err);
                      }
                  );
          }
      }


    function getRootCauseAnalysis(alarm_id, adminState) {
      if (vitrageAPI) {
        return vitrageAPI.getRca(alarm_id, adminState)
          .then(function (data) {
            return data;
          })
          .catch(function (err) {
              console.error(err);
            }
          );
      }
    }

        return {
            getTopology: getTopology,
            getAlarms: getAlarms,
            getHistoryAlarms: getHistoryAlarms,
            getRootCauseAnalysis: getRootCauseAnalysis,
            getTemplates: getTemplates,
            deleteTemplate: deleteTemplate,
            validateTemplate: validateTemplate,
            addTemplate: addTemplate
        };
    }
})();
