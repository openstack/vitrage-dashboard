angular
  .module('horizon.dashboard.project.vitrage')
  .directive('hzVms', hzVms);

function hzVms() {
  var directive = {
    link: link,
    templateUrl: STATIC_URL + 'dashboard/project/components/vms/vms.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {

  }
}
