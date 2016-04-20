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
            circleRadius = 14,
            circlePadding = 1,
            pinned = horizon.cookies.get('pinned') || [],
            zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom]);

        scope.$watch('data', function(newVal, oldVal) {
            if (newVal) {
                prepareData();
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
            /*.charge(function(d) {
                var charge;
                var category = (d.category || 'no_category').toLowerCase(),
                    icon_size;

                if (category === 'alarm') {
                    charge = -100;
                } else {
                    var type = (d.type || 'no_type').toLowerCase();

                    switch (type) {
                        case 'openstack.cluster':
                            charge = -10000;
                            break;
                        case 'nova.zone':
                            charge = -5000;
                        case 'nova.host':
                            charge = -5000;
                        case 'nova.instance':
                        case 'neutron.port':
                        case 'cinder.volume':
                        case 'neutron.network':
                        default:
                            charge = -500;
                    }
                }
                return charge;
            }) //-100*/
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

        var drag = force.drag()
            .on('dragend', nodeDragend);
            //.on('dragstart', nodeDragstart);

        resize();
        d3.select(window).on('resize', resize);

        function resize() {
            svg.attr('height', window.innerHeight - 168 + 'px')
            force.size([angular.element(svg[0]).width(),
                angular.element(svg[0]).height()])
                .resume();
        }

        function prepareData() {
            _.each(pinned, function(pin) {
                var node = _.find(scope.data.nodes, function(node) {
                    return pin.id === node.id;
                });

                if (node) {
                    node.fixed = true;
                    node.x = pin.x;
                    node.y = pin.y;
                }
            })
        }

        function createGraph() {

            var json = scope.data;

            function collide(alpha) {
                var quadtree = d3.geom.quadtree(json.nodes);
                return function(d) {
                    var rb = 2 * circleRadius + circlePadding,
                        nx1 = d.x - rb,
                        nx2 = d.x + rb,
                        ny1 = d.y - rb,
                        ny2 = d.y + rb;
                    quadtree.visit(function(quad, x1, y1, x2, y2) {
                        if (quad.point && (quad.point !== d)) {
                            var x = d.x - quad.point.x,
                                y = d.y - quad.point.y,
                                l = Math.sqrt(x * x + y * y);
                            if (l < rb) {
                                l = (l - rb) / l * alpha;
                                d.x -= x *= l;
                                d.y -= y *= l;
                                quad.point.x += x;
                                quad.point.y += y;
                            }
                        }
                        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                    });
                };
            }

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
                .classed('pinned', function(d) { return d.fixed; })
                .call(force.drag)
                .on('click', nodeClick)
                .on('mousedown', function(d) { d3.event.stopPropagation() })
                .on('dblclick', pinNode)
                .call(drag);

            var content = node.append('g')
                            .classed('node-contenet', true);

            content.append('circle')
                .attr('r', circleRadius + 'px');

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
                                icon = '\uf013'; //fa-cog
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

                node.each(collide(0.5));
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

                updatePinnedCookie(d);
            }

            d3.event.stopImmediatePropagation();
            d3.event.preventDefault();

            //fixing some bug with unpinning
            setTimeout(function() {
                force.resume()
            }, 100)
        }

        function updatePinnedCookie(d) {
            var pinIndex = -1;
            pinned.forEach(function(pin, i) {
                if (pin.id === d.id) {
                    pinIndex = i
                }
            })

            if (pinIndex > -1) {
                pinned.splice(pinIndex, 1);
            }

            if (d.fixed) {
                pinned.push({id: d.id, x: d.x, y: d.y});
            }

            horizon.cookies.put('pinned', pinned);
        }

        function nodeDragend(d) {
            if (d.fixed) {
                updatePinnedCookie(d);
            }
        }

        /*function nodeDragstart(d) {
            d3.select(this).classed('pinned', d.fixed = true);
        }*/

    }
}
