angular
  .module('horizon.dashboard.project.vitrage')
  .directive('hzAlarms', hzAlarms);

function hzAlarms() {
  var directive = {
    link: link,
    templateUrl: STATIC_URL + 'dashboard/project/components/alarms/alarms.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {

  }
}
