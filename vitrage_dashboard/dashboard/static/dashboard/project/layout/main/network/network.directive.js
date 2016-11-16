angular
  .module('horizon.dashboard.project.vitrage')
  .directive('hzNetwork', hzNetwork);

function hzNetwork() {
  var directive = {
    link: link,
    templateUrl: STATIC_URL + 'dashboard/project/layout/main/network/network.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {

  }
}
