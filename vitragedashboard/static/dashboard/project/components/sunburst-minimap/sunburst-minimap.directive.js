angular.module('horizon.dashboard.project.vitrage')
  .directive('hzSunburstMinimap', [
    function () {
      return {
        restrict: 'E',
        scope: {
          selected: '='
        },
        templateUrl: STATIC_URL + 'dashboard/project/components/sunburst-minimap/sunburst-minimap.html'
      };
    }
  ]);
