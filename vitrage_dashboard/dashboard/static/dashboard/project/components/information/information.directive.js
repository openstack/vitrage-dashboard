angular
  .module('horizon.dashboard.project.vitrage')
  .directive('hzInformation', hzInformation);

function hzInformation() {
  var directive = {
    link: link,
    templateUrl: STATIC_URL + 'dashboard/project/components/information/information.html',
    restrict: 'E',
    scope:{
      selected:'='
    }
  };
  return directive;

  function link(scope, element, attrs) {
    scope.$watch('selected', function(newValue, oldValue) {
      scope.parseSelected = {
        "Name": newValue.name,
        "ID": newValue.id,
        "Type": newValue.type,
        "State": newValue.state
      }
    })
  }
}
