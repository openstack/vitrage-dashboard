angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzEntitiesInfo', hzEntitiesInfo);

hzEntitiesInfo.$inject = ['$filter'];

function hzEntitiesInfo($filter) {
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
        scope.blackList = ['is_real_vitrage_id', 'vitrage_is_deleted', 'vitrage_is_placeholder', 'index', 'graph_index',
            'fixed', 'weight', 'px', 'py', 'x', 'y', 'width', 'height', 'bbox', 'high', 'highDepth', 'datasource_name',
            'dateFormat', 'timezone', 'vitrage_cached_id', 'vitrage_resource_id', 'vitrage_resource_type'];
        scope.parseItem = {};

        // TODO: Order info by this priority
        var topPriority = ['Vitrage resource type', 'Vitrage operational severity', 'Vitrage category', 'vitrage_aggregated_severity', 'vitrage_type', 'vitrage_operational_state']

        scope.$watch('item', function (newData, oldData) {
            if (newData !== undefined && newData != oldData) {
                var tmpItem = copyObject(scope.item);
                var itemParsed = {};

                // 1. Replace _ with spaces
                // 2. First letter uppercase
                for (var property in tmpItem) {
                    if (scope.blackList.indexOf(property) < 0) {
                        if (tmpItem.hasOwnProperty(property)) {
                            var parsedProperty = '';
                            parsedProperty= property.split("_").join(" ");
                            parsedProperty = parsedProperty.charAt(0).toUpperCase() + parsedProperty.substr(1).toLowerCase();
                            if (parsedProperty.includes('timestamp')) {
                                itemParsed[parsedProperty] = $filter('vitrageDate')(tmpItem[property], tmpItem['dateFormat'], tmpItem['timezone']);
                            } else {
                                itemParsed[parsedProperty] = tmpItem[property];
                            }
                        }
                    }
                }

                scope.parseItem = itemParsed;
            }
        });

        function copyObject(orig, deep) {
            // 1. copy has same prototype as orig
            var copy = Object.create(Object.getPrototypeOf(orig));

            // 2. copy has all of orig’s properties
            copyOwnPropertiesFrom(copy, orig, deep);

            return copy;
        }

        function copyOwnPropertiesFrom(target, source, deep) {
            Object.getOwnPropertyNames(source)
                .forEach(function(propKey) {
                    var desc = Object.getOwnPropertyDescriptor(source, propKey);
                    Object.defineProperty(target, propKey, desc);
                    if (deep && typeof desc.value === 'object') {
                        target[propKey] = copyObject(source[propKey], deep);
                    }
                });
            return target;
        }
    }


}
