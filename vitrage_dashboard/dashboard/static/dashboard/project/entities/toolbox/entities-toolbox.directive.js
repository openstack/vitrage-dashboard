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
            item: '=',
            searchText: '=',
            autoRefresh: '='
        }
    };
    return directive;

    function link(scope, element, attrs) {

        scope.autoRefresh = !!horizon.cookies.get('entitiesAutomaticRefresh');
        console.log('Getting autoRefresh cookie: ', scope.autoRefresh);

        scope.broadcast = function(event) {
            console.log('click', event);
            $rootScope.$broadcast('toolbox-' + event);
        }
    }
}
