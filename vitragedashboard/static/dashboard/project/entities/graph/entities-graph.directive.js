angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzEntitiesGraph', hzEntitiesGraph);

function hzEntitiesGraph() {
    var directive = {
        link: link,
        scope: {
            data: '=',
            selected: '=',
            itemSelected: '&',
            search: '='
        },
        templateUrl: STATIC_URL + 'dashboard/project/entities/graph/entities-graph.html',
        restrict: 'E'
    };
    return directive;

    function link(scope, element, attrs) {


        var min_zoom = 0.3,
            max_zoom = 4,
            zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom]);

        scope.$watch('data', function(newVal, oldVal) {
            if (newVal) {
                createGraph();
            }
        })

        var svg = d3.select(element[0]).select('svg')
            .style('cursor', 'move')
            .attr('width', '100%')
            .attr('pointer-events', 'all');

        svg.call(zoom);

        zoom.on('zoom', function() {
            console.log('zoom', zoom.scale());
        })

        var force = d3.layout.force()
            .gravity(0.05)
            .distance(100)
            //.linkDistance(200)
            .charge(-100);


        resize();
        d3.select(window).on('resize', resize);

        function resize() {
            svg.attr('height', window.innerHeight - 200 + 'px')
            force.size([angular.element(svg[0]).width(),
                angular.element(svg[0]).height()])
                .resume();
        }

        function createGraph() {

            var json = scope.data;

            force
                .nodes(json.nodes)
                .links(json.links)
                .start();

            var link = svg.selectAll('.link')
                .data(json.links)
                .enter().append('line')
                .attr('class', 'link');

            var node = svg.selectAll('.node')
                .data(json.nodes)
                .enter().append('g')
                .attr('class', 'node')
                .call(force.drag)
                .on('click', nodeClick);
            
            node.append('circle')

            node.append('text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('transform', 'scale(1)')
                .attr('class', function(d) {
                    var cls = '';
                    var severity = d.severity || d.normalized_severity;
                    if (severity) {
                        switch (severity.toLowerCase()) {
                            case 'critical':
                            case 'severe':
                                cls = 'red';
                                break;
                            case 'warning':
                                cls = 'orange';
                                break;
                            default: //'DISABLED', 'UNKNOWN', 'UNDEFINED'
                                cls = 'gray';
                                break;
                        }
                    }
                    return cls;
                })
                .style('font-size', function(d) {
                    var category = d.category;
                    if (category && category.toLowerCase() === 'alarm') {
                        return '18px'
                    }
                    return '20px'
                })
                .style('stroke', function(d) {
                    var category = d.category;
                    if (category && category.toLowerCase() === 'alarm') {
                        return '18px'
                    }
                    return '20px'
                })
                .classed('icon', true)
                .text(function(d) {
                    var category = d.category;
                    if (category && category.toLowerCase() === 'alarm') {
                        return '\uf0f3'; //\uf0a2'; //bell-o
                    }
                    return '\uf013' //gear
                });

            node.append('text')
                .attr('dx', 18)
                .attr('dy', '.35em')
                .text(function(d) { return d.name });

            force.on('tick', function() {
                link.attr('x1', function(d) { return d.source.x; })
                    .attr('y1', function(d) { return d.source.y; })
                    .attr('x2', function(d) { return d.target.x; })
                    .attr('y2', function(d) { return d.target.y; });

                node.attr('transform', function(d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                });
            });
        }

        function nodeClick(d) {
            scope.selected = d;
            //scope.itemSelected(scope.selected);

            d3.event.stopImmediatePropagation();
            d3.event.preventDefault();

            scope.$emit('graphItemClicked', d);

            svg.selectAll('.node')
                .classed('selected', false);

            d3.select(this)
                .classed('selected', true);

        }

    }
}
