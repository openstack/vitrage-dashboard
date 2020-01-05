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
            search: '=',
            searchItem: '='
        },
        templateUrl: STATIC_URL + 'dashboard/project/entities/graph/entities-graph.html',
        restrict: 'E'
    };
    return directive;

    function link(scope, element, attrs) {


        var minZoom = 0.3,
            maxZoom = 4,
            linkWidth = 1,
            circleRadius = 18,
            circlePadding = 1,
            zoom = d3.behavior.zoom().scaleExtent([minZoom, maxZoom]),
            ellipsisWidth = 80,
            hightlightDepth = 2,
            heightOffset,
            pinned,
            graphCreated,
            node,
            link,
            linksMap,
            content,
            mouseDownX,
            mouseDownY;

        (function() {
            var p = $('.panel.panel-primary');
            heightOffset = (p.length ? p.offset().top : 180) + 75;

            pinned = horizon.cookies.get('pinned') || [];
            if (_.isString(pinned)) {
                try {
                    pinned = JSON.parse(pinned);
                }
                catch(ex) {
                    pinned = [];
                    console.error('Failed to parse the pinned cookie');
                }
             }
        })();

        scope.$watch('searchItem', function(newData, oldData) {
         if (newData != oldData) {
             console.log('searching for node: ', newData);
             searchNode(newData);
         }
        });

        function searchNode(value) {
            value = value.toLowerCase();
            var allNodes = d3.select("svg g").selectAll("g")
              .filter(function(d, i){ return this.classList.contains("node"); })
              .selectAll("circle");

            allNodes
              .transition()
              .duration(200)
              .style("stroke", "darkgray")
              .style("stroke-width", "1")
              .style("fill", "#FFFFFF")
              .attr('r', function(item) { return circleRadius; });

            // Set special style to the found node
            if (value && value !== '') {
                var theNodes = d3.select("svg g").selectAll("g")
                  .filter(function(d, i){ return this.classList.contains("node"); })
                  .filter(function(d, i){ return d.name ? d.name.toLowerCase().indexOf(value) > -1 : ''; })
                  .selectAll("circle");

                theNodes
                  .transition()
                  .duration(400)
                  .style("stroke", "#006600")
                  .style("stroke-width", "3")
                  .style("fill", "#51EFD2")
                  .attr('r', function(item) { return 40; });
            }

        }

        scope.$watch('data.ts', function(newVal, oldVal) {
            if (newVal) {
                prepareData();

                if (!graphCreated) {
                    createGraph();
                } else {
                    drawGraph();
                }
            }
        });

        scope.$on('toolbox-pin', function () {
            pinAll();
        });

        scope.$on('toolbox-unpin', function () {
            unpinAll();
        })

        scope.$on('toolbox-zoom-to-fit', function () {
            console.log('on toolbox-pin', arguments)
        });

        scope.$on('toolbox-toggle-fullscreen', function () {
            console.log('on toolbox-unpin', arguments)
        })

        scope.isEmpty = function() {
          return scope.data && scope.data.nodes && scope.data.nodes.length === 0;
        };

        var svg = d3.select(element[0]).select('svg')
            .style('cursor', 'move')
            .attr('width', '100%')
            .attr('pointer-events', 'all');
            //.on('click', selectNone);

        svg.call(zoom);

        svg.on('mousedown', function() {
            mouseDownX = d3.event.clientX;
            mouseDownY = d3.event.clientY;
        });

        svg.on('mouseup', function() {
            var x = d3.event.clientX,
                y = d3.event.clientY;
            if (x === mouseDownX && y === mouseDownY) {
                // means click rather than drag
                svgClick();
            }
        });

        var svg_g = svg.append('g')
            .attr('width', '100%')
            .attr('height', '100%')

        link = svg_g.selectAll('.link');

        node = svg_g.selectAll('.node');

        var force = d3.layout.force()
            .gravity(0.15)
            //.distance(200)
            .charge(-1000)
            //.friction(0.8)
            .linkDistance(function(d) {
                if (d.relationship_type === 'on') {
                    return 80;
                }
                return 120;
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
            svg.attr('height', window.innerHeight - heightOffset + 'px')
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

            linksMap = {};
            _.each(scope.data.links, function(link) {
                linksMap[link.source.id + ',' + link.target.id] = true;
            });
        }

        function createGraph() {

            graphCreated = true;

            function collide(node) {
                return function(quad, x1, y1, x2, y2) {
                    var updated = false;
                    if (quad.point && (quad.point !== node)) {

                        var x = node.x - quad.point.x,
                            y = node.y - quad.point.y,
                            xSpacing = (quad.point.width + node.width) / 2,
                            ySpacing = (quad.point.height + node.height) / 2,
                            absX = Math.abs(x),
                            absY = Math.abs(y),
                            l,
                            lx,
                            ly;

                        if (absX < xSpacing && absY < ySpacing) {
                            l = Math.sqrt(x * x + y * y);

                            lx = (absX - xSpacing) / l;
                            ly = (absY - ySpacing) / l;

                            // the one that's barely within the bounds probably triggered the collision
                            if (Math.abs(lx) > Math.abs(ly)) {
                                lx = 0;
                            } else {
                                ly = 0;
                            }

                            node.x -= x *= lx;
                            node.y -= y *= ly;
                            quad.point.x += x;
                            quad.point.y += y;

                            updated = true;
                        }
                    }
                    return updated;
                };
            }

            /*function collide(alpha) {
                var quadtree = d3.geom.quadtree(scope.data.nodes);
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
            }*/

            force.nodes(scope.data.nodes)
                .links(scope.data.links);

            force.on('tick', function() {
                link.attr('x1', function(d) { return d.source.x; })
                    .attr('y1', function(d) { return d.source.y; })
                    .attr('x2', function(d) { return d.target.x; })
                    .attr('y2', function(d) { return d.target.y; });

                node.attr('transform', function(d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                });

                //node.each(collide(0.5));

                var nodes = scope.data.nodes;

                var q = d3.geom.quadtree(nodes),
                    i = 0,
                    n = nodes.length;
                while (++i < n) {
                    q.visit(collide(nodes[i]));
                }
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
                //content.attr('transform', 'scale(' + scale + ')');
                svg_g.selectAll('.node-content').attr('transform', 'scale(' + scale + ')');

                svg_g.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');

            });

            drawGraph();
        }

        window.drawGraph = drawGraph;
        window.dforce = force;

        function drawGraph() {
            link = link.data(force.links(), function(d) { return d.source.id + '-' + d.target.id; });
            link
                .enter().append('line')
                .attr('class', 'link')
            link.exit().remove();

            node = node.data(force.nodes(), function(d) { return d.id;});
            content = node
                .enter().append('g')
                .attr('class', 'node')
                .attr('name', function(d) {
                    return d.name;
                })
                .classed('pinned', function(d) { return d.fixed; })
                .call(force.drag)
                .on('click', nodeClick)
                .on('mousedown', function(d) { d3.event.stopPropagation() })
                .on('dblclick', pinNode)
                .call(drag)
                .append('g')
                .classed('node-content', true);


            //Only for updates
            /*content
                .attr('transform', 'scale(0)')
                .transition(750)
                .attr('transform', 'scale(1)');*/

            node.exit()
                .select('.node-content')
                .transition()
                .duration(750)
                .attr('transform', 'scale(0)')

            node.exit()
                .transition()
                .duration(750)
                .remove();

            content.append('circle')
                .attr('r', circleRadius + 'px');

            content.append('text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('transform', 'scale(1)')
                .attr('class', function(d) {
                    var category = d.vitrage_category,
                        cls = '';

                    if (category && category.toLowerCase() === 'alarm') {
                        var severity = d.vitrage_operational_severity;
                        if (severity) {
                            switch (severity.toLowerCase()) {
                                case 'critical':
                                    cls = 'red';
                                    break;
                                case 'severe':
                                    cls = 'orange';
                                    break;
                                case 'warning':
                                    cls = 'yellow';
                                    break;
                                case 'ok':
                                    cls = 'green';
                                    break;
                                case 'n/a':
                                    cls = 'gray';
                                    break;
                                default: //'DISABLED', 'UNKNOWN', 'UNDEFINED'
                                    cls = 'gray';
                                    break;
                            }
                        }
                    } else {
                        var state = d.vitrage_operational_state;
                        if (state) {
                            switch (state.toLowerCase()) {
                                case 'error':
                                    cls = 'red';
                                    break;
                                case 'suboptimal':
                                    cls = 'yellow';
                                    break;
                                case 'n/a':
                                    cls = 'gray';
                                    break;
                            }
                        }
                    }
                    return cls;
                })
                .style('font-size', function(d) {
                    var category = d.vitrage_category || 'no_category',
                        icon_size;

                    if (category && category.toLowerCase() === 'alarm') {
                        icon_size = '18px';
                    } else {
                        var type = d.vitrage_type || 'no_type';
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
                    var category = d.vitrage_category;
                    if (category && category.toLowerCase() === 'alarm') {
                        return '18px';
                    }
                    return '20px';
                })
                .classed('icon', true)
                .classed('fill-only', function(d) {
                    var type = (d.vitrage_type || '').toLowerCase();
                    if (type && type === 'nova.host' || type === 'cinder.volume') {
                        return true;
                    }
                })
                .text(function(d) {
                    var category = d.vitrage_category,
                        icon;

                    if (category && category.toLowerCase() === 'alarm') {
                        icon = '\uf0f3'; //\uf0a2'; //bell-o
                    } else {
                        var type = d.vitrage_type || 'no_type';
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
                            case 'heat.stack':
                                icon = '\uf1b3'; //fa-cubes
                                break;
                            default:
                                icon = '\uf013'; //fa-cog
                                break;
                        }
                    }
                    return icon;
                });

            content.append('text')
                .classed('pin', true)
                .attr('dx', '-18px')
                .attr('dy', '-12px')
                .text('\uf08d')
                .on('click', pinNode);

            var textNode = content.append('text')
                .classed('.label', true)
                .attr('dx', 18)
                .attr('dy', '.35em')
                .text(function(d) {
                    return d.name;
                })
                .call(function(textNodes) {
                    textNodes.each(function(d) {
                        if (d.name) {
                            setEllipsis(this, d.name, ellipsisWidth);
                            d.bbox = this.getBBox();
                        }
                        d.width = 2 * (circleRadius + circlePadding) + (d.bbox ? d.bbox.width * 2 : 0);
                        d.height = 2 * (circleRadius + circlePadding);
                    });
                })
                .append('title')
                .text(function(d) { return d.name; });

            content.insert('rect', 'text.pin')
                .attr('width', function(d) {
                    return d.bbox ? d.bbox.width + 4: 0;
                })
                .attr('height', function(d) {
                    return d.bbox ? d.bbox.height + 2 : 0;
                })
                .attr('x', 16)
                .attr('y', -8)
                .attr('rx', 4)
                .attr('ry', 4)
                .classed('text-bg', true);

            force.start();
        }

        function setAllNodesHighlight() {
            svg_g.selectAll('.node')
                .classed('selected', function(d) {
                    return d.high;
                })
                .select('circle')
                .style('stroke-width', function(d) {
                    return d.high ? (Math.max(d.highDepth + 1, 1) * 2) : null;
                })

            svg_g.selectAll('.link').classed('selected', function(d) {
                return d.source.high && d.target.high;
            });
        }

        function svgClick() {
            scope.selected = undefined;
            svg_g.selectAll('.node')
                .classed('selected', false);

            _.each(scope.data.nodes, function(node) {
                node.high = false;
                node.highDepth = 0;
            });

            _.each(scope.data.links, function(link) {
                link.high = false;
            })

            setAllNodesHighlight();

            scope.$emit('unselectNode');
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
                //d3.select(this).classed('selected', true);

                findHighlight(d);
            }
        }

        function findHighlight(rootNode) {

            _.each(scope.data.nodes, function(node) {
                node.high = false;
            })

            var depth = hightlightDepth;

            findNodes(rootNode, depth, scope.data.nodes, linksMap);

            _.each(scope.data.links, function(link) {
                link.high = false;
            })

            setAllNodesHighlight();
        }

        function selectNone(d) {
            nodeClick(null);
        }

        function pinNode(d) {
            d3.event.stopImmediatePropagation();
            d3.event.preventDefault();

            var node;

            if ($(this).is('.node')) {
                node = d3.select(this);
            } else if ($(this).is('.pin')) {
                node = d3.select(this.parentNode.parentNode);
            }

            if (node) {
                node.classed('pinned', d.fixed = (d.fixed ? false : true));

                updatePinnedCookie(d);
            }

            //fixing some bug with unpinning
            /*setTimeout(function() {
                force.resume()
            }, 100)*/
        }

        function updatePinnedCookie(d) {
            var pinIndex = -1;
            pinned.forEach(function(pin, i) {
                if (pin.id === d.id) {
                    pinIndex = i;
                }
            })

            if (pinIndex > -1) {
                pinned.splice(pinIndex, 1);
            }

            if (d.fixed) {
                pinned.push({id: d.id, x: d.x, y: d.y});
            }

            horizon.cookies.put('pinned', JSON.stringify(pinned));
        }

        function nodeDragend(d) {
            if (d.fixed) {
                updatePinnedCookie(d);
            }
        }

        function pinAll() {
            pinned = [];

            svg_g.selectAll('.node')
                .classed('pinned', true)
                .each(function(d) {
                    d.fixed = true;
                    pinned.push({id: d.id, x: d.x, y: d.y});
                })

            horizon.cookies.put('pinned', JSON.stringify(pinned));
        }

        function unpinAll() {
            pinned = [];

            svg_g.selectAll('.node')
                .classed('pinned', false)
                .each(function(d) {
                    d.fixed = false;
                })

            horizon.cookies.put('pinned', JSON.stringify([]));

            setTimeout(function() {
                force.resume()
            }, 100)
        }

        function pinAllNodes(isPin) {

        }

        function setEllipsis(el, text, width) {

            el.textContent = text;

            if (el.getSubStringLength(0, text.length) >= width) {

                for (var x = text.length - 3; x > 0; x -= 3){

                    if (el.getSubStringLength(0, x) <= width){

                        el.textContent = text.substring(0, x) + '...';
                        return;
                    }
                }

                el.textContent = '...';
            }
        };

        function findNodes(rootNode, depth, allNodes, linksMap) {
            if (rootNode) {
                rootNode.high = true;
                rootNode.highDepth = depth;
                depth--;

                _.each(allNodes, function(node) {
                    if (linksMap[node.id + ',' + rootNode.id] || linksMap[rootNode.id + ',' + node.id]) {

                        if (depth > -1 && !node.high) {
                            findNodes(node, depth, allNodes, linksMap);
                        } else if (depth <= -1) {
                            //Always find 'depth' + alarms & (sdns + alarms)
                            if (node && node.vitrage_category && node.vitrage_category.toLowerCase() === 'alarm') {
                                node.high = true;
                                node.highDepth = 0;
                            } else if (!node.high && node.vitrage_type && node.vitrage_type.toLowerCase() === 'sdn_controller') {
                                findNodes(node, depth, allNodes, linksMap);
                            }
                        }
                    }
                });
            }
        }

        /*function nodeDragstart(d) {
            d3.select(this).classed('pinned', d.fixed = true);
        }*/

    }
}
