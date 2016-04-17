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
            linkWidth = 1.5,
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
            //.on('click', selectNone);

        svg.call(zoom);

        var svg_g = svg.append('g')
            .attr('width', '100%')
            .attr('height', '100%')

        var force = d3.layout.force()
            .gravity(0.05)
            .distance(100)
            .charge(-100)
            //.friction(0.8)
            .linkDistance(function(d) {
                if (d.relationship_type === 'on') {
                    return 80;
                }
                return 160;
            })
            .linkStrength(function(d) {
                if (d.relationship_type === 'on') {
                    return 2;
                }
                return 0.5;
            });

        window.force = force;

        var drag = force.drag()
            //.on('dragstart', nodeDragstart);

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

            var link = svg_g.selectAll('.link')
                .data(json.links)
                .enter().append('line')
                .attr('class', 'link');

            var node = svg_g.selectAll('.node')
                .data(json.nodes)
                .enter().append('g')
                .attr('class', 'node')
                .call(force.drag)
                .on('click', nodeClick)
                .on('mousedown', function(d) { d3.event.stopPropagation() })
                .on('dblclick', pinNode)
                .call(drag);

            var content = node.append('g')
                            .classed('node-contenet', true);

            content.append('circle');

            content.append('text')
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
                    var category = d.category || 'no_category',
                        icon_size;

                    if (category && category.toLowerCase() === 'alarm') {
                        icon_size = '18px';
                    } else {
                        var type = d.type || 'no_type';
                        switch(type.toLowerCase()) {
                            case 'nova.instance':
                            case 'nova.host':
                            case 'nova.zone':
                            case 'neutron.port':
                                icon_size = '16px'; //fa-external-link-square
                                break;
                            case 'openstack.cluster':
                                icon_size = '18px'; //fa-cloud
                                break;
                            case 'cinder.volume':
                                icon_size = '22px';
                                break;
                            case 'neutron.network':
                            default:
                                icon_size = '20px';
                                break;
                        }
                    }

                    return icon_size;
                })
                .style('stroke', function(d) {
                    var category = d.category;
                    if (category && category.toLowerCase() === 'alarm') {
                        return '18px'
                    }
                    return '20px'
                })
                .classed('icon', true)
                .classed('fill-only', function(d) {
                    var type = (d.type || '').toLowerCase();
                    if (type && type === 'nova.host' || type === 'cinder.volume') {
                        return true;
                    }
                })
                .text(function(d) {
                    var category = d.category,
                        icon;

                    if (category && category.toLowerCase() === 'alarm') {
                        icon = '\uf0f3'; //\uf0a2'; //bell-o
                    } else {
                        var type = d.type || 'no_type';
                        switch(type.toLowerCase()) {
                            case 'nova.instance':
                                icon = '\uf108'; //fa-desktop
                                break;
                            case 'nova.host':
                                icon = '\uf233'; //fa-server
                                break;
                            case 'nova.zone':
                                icon = '\uf279'; //fa-map
                                break;
                            case 'neutron.network':
                                icon = '\uf0ac'; //fa-globe
                                break;
                            case 'neutron.port':
                                icon = '\uf14c'; //fa-external-link-square
                                break;
                            case 'cinder.volume':
                                icon = '\uf0a0'; //fa-hdd-o
                                break;
                            case 'openstack.cluster':
                                icon = '\uf0c2'; //fa-cloud
                                break;
                            default:
                                icon = '';
                                break;
                        }
                    }
                    return icon
                });

            content.append('text')
                .classed('pin', true)
                .attr('dx', '-18px')
                .attr('dy', '-12px')
                .text('\uf08d')
                .on('click', pinNode)

            //var label = node.append('text')
            content.append('text')
                .classed('.label', true)
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

            zoom.on('zoom', function() {
                var strokeWidth = linkWidth / zoom.scale();
                if (strokeWidth > linkWidth) {
                    strokeWidth = linkWidth;
                }

                link.style('stroke-width', strokeWidth);

                var scale = 1 / (zoom.scale() / 1.2);
                if (scale > 1) {
                    scale = 1;
                }
                content.attr('transform', 'scale(' + scale + ')');

                svg_g.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');

            })
        }

        function nodeClick(d) {
            scope.selected = d;
            //scope.itemSelected(scope.selected);

            d3.event.stopImmediatePropagation();
            d3.event.preventDefault();

            scope.$emit('graphItemClicked', d);

            svg_g.selectAll('.node')
                .classed('selected', false);


            if ($(this).is('.node')) {
                d3.select(this).classed('selected', true);
            }
        }

        function selectNone(d) {
            nodeClick(null);
        }

        function pinNode(d) {
            var node;

            if ($(this).is('.node')) {
                node = d3.select(this);
            } else if ($(this).is('.pin')) {
                node = d3.select(this.parentNode.parentNode);
            }

            if (node) {
                node.classed('pinned', d.fixed = d.fixed ? false : true);
            }

            d3.event.stopImmediatePropagation();
            d3.event.preventDefault();

            //fixing some bug with unpinning
            setTimeout(function() {
                force.resume()
            }, 100)
        }

        /*function nodeDragstart(d) {
            d3.select(this).classed('pinned', d.fixed = true);
        }*/

    }
}
