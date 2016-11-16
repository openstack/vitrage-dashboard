angular.module('horizon.dashboard.project.vitrage')
  .directive('hzSunburstMinimap', [
    function ($scope) {

      function link(scope, element, attr, ctrl) {
        scope.STATIC_URL = STATIC_URL;
      }

      return {
        link: link,
        restrict: 'E',
        scope: {
          selected: '='
        },
        templateUrl: STATIC_URL + 'dashboard/project/components/sunburst-minimap/sunburst-minimap.html'
      };
    }
  ]);
