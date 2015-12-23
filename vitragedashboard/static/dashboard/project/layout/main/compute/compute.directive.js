angular
  .module('horizon.dashboard.project.vitrage')
  .directive('hzCompute', hzCompute);

function hzCompute() {
  var directive = {
    link: link,
    templateUrl: STATIC_URL + 'dashboard/project/layout/main/compute/compute.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {

  }
}
