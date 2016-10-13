angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzEntitiesToolbox', hzEntitiesToolbox);

hzEntitiesToolbox.$inject = ['$rootScope'];

function hzEntitiesToolbox($rootScope) {
    var directive = {
        link: link,
        templateUrl: STATIC_URL + 'dashboard/project/entities/toolbox/entities-toolbox.html',
        restrict: 'E',
        scope: {
            item: '='
        }
    };
    return directive;

    function link(scope, element, attrs) {
        scope.broadcast = function(event) {
            console.log('click', event);
            $rootScope.$broadcast('toolbox-' + event);
        }
    }
}
