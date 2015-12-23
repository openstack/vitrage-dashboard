angular
  .module('horizon.dashboard.project.vitrage')
  .directive('hzStacks', hzStacks);

function hzStacks() {
  var directive = {
    link: link,
    templateUrl: STATIC_URL + 'dashboard/project/components/stacks/stacks.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {

  }
}
