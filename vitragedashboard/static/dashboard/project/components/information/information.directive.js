angular
  .module('horizon.dashboard.project.vitrage')
  .directive('hzInformation', hzInformation);

function hzInformation() {
  var directive = {
    link: link,
    templateUrl: STATIC_URL + 'dashboard/project/components/information/information.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {

  }
}
