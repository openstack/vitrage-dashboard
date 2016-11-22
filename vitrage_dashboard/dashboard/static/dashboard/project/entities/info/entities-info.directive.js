angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzEntitiesInfo', hzEntitiesInfo);

function hzEntitiesInfo() {
    var directive = {
        link: link,
        templateUrl: STATIC_URL + 'dashboard/project/entities/info/entities-info.html',
        restrict: 'E',
        scope: {
            item: '='
        }
    };
    return directive;

    function link(scope, element, attrs) {
        scope.blackList = ['name', 'is_deleted', 'is_placeholder', 'index', 'graph_index',
            'fixed', 'weight', 'px', 'py', 'x', 'y', 'width', 'height', 'bbox', 'high', 'highDepth'];
    }
}
