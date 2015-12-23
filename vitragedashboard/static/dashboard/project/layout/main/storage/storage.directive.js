angular
  .module('horizon.dashboard.project.vitrage')
  .directive('hzStorage', hzStorage);

function hzStorage() {
  var directive = {
    link: link,
    templateUrl: STATIC_URL + 'dashboard/project/layout/main/storage/storage.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {

  }
}
