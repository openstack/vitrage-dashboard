angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzRootCauseAnalysisGraph', hzRootCauseAnalysisGraph);

hzRootCauseAnalysisGraph.$inject = ['$filter', 'timeSrv'];

function hzRootCauseAnalysisGraph($filter, timeSrv) {
    var directive = {
        link: link,
        templateUrl: STATIC_URL + 'dashboard/project/components/rca/rootCauseAnalysisGraph.html',
        restrict: 'E'
    };
    return directive;

    function link(scope, element, attr, ctrl) {
        scope.STATIC_URL = STATIC_URL;
        scope.timezone = timeSrv.getHorizonTimezone();
        scope.dateFormat = timeSrv.rcaDateFormat;
        var lastSelectedNode = {id: "", value: ""};

        function setSelected(u) {
            if (lastSelectedNode.id != "" && lastSelectedNode.id != u) {
                lastSelectedNode.value.label = replaceAll(lastSelectedNode.value.label, "color: #ffffff", "color: #44575e;");
                lastSelectedNode.value.label = replaceAll(lastSelectedNode.value.label, '#FFFFFF" class="fa fa-thumb-tack', '#44575e" class="fa fa-thumb-tack');
                g.setNode(lastSelectedNode.id, {
                    labelType: "html",
                    label: lastSelectedNode.value.label,
                    rx: 26,
                    ry: 26,
                    padding: 0,
                    class: replaceAll(lastSelectedNode.value.class, " selectedNode", "")
                });
            }

            lastSelectedNode = {id: u, value: g._nodes[u]};
            var temp = g._nodes[u];
            if (temp) {
                temp.label = temp.label.replace("background: #ffffff;", "background: #000000");
                temp.label = replaceAll(temp.label, "color: #44575e;", "color: #ffffff");
                temp.label = replaceAll(temp.label, '#44575e" class="fa fa-thumb-tack', '#FFFFFF" class="fa fa-thumb-tack');

                g.setNode(u, {
                    labelType: "html",
                    label: temp.label,
                    rx: 26,
                    ry: 26,
                    padding: 0,
                    class: temp.class + " selectedNode out"
                });

                scope.selected = getSelectedObject(u);
                inner.call(render, g);
            }
        }

        var replaceAll = function (str, strSearch, strReplaceWith) {
            var strRes = str.replace(new RegExp(strSearch, "g"), strReplaceWith);
            return strRes;
        };

        function getSelectedObject(alertId) {
            for (var i = 0; i < scope.data.nodes.length; i++) {
                if (scope.data.nodes[i].id == alertId) {
                    return scope.data.nodes[i];
                }
            }
        }

        function cleanGraph() {
            var nodes = g.nodes();
            var edges = g.edges();
            for (var i = 0; i < nodes.length; i++) {
                g.removeNode(nodes[i]);
            }
            for (var j = 0; j < edges.length; j++) {
                g.removeEdge(edges[j]);
            }
        }

        function createGraph() {
            draw(scope.data, true);
        }

        // Set up zoom support
        var svg = d3.select("#root-cause-analysis-graph"),
            inner = svg.select("g"),
            zoom = d3.behavior.zoom().scaleExtent([0.1, 2]).on("zoom", function () {
                inner.attr("transform", "translate(" + d3.event.translate + ")" +
                    "scale(" + d3.event.scale + ")");
            });
        svg.call(zoom);

        var render = new dagreD3.render();

        // Left-to-right layout
        var g = new dagreD3.graphlib.Graph();
        g.setGraph({
            nodesep: 70,
            ranksep: 50,
            rankdir: "UD",//UD up and down , RL right to left
            marginx: 20,
            marginy: 20
        });

        function draw(data, newGraph) {
            if (newGraph) {
                angular.forEach(data.nodes, function (key, value) {
                    var className = " clickable";

                    var alertName = key.name,               // CPU load
                        alertCategory = key.vitrage_category,           // ALARM
                        alertInfo = key.info || '',             // WARNING - 15min load 1.66 at 32 CPUs
                        alertResourceId = key.vitrage_resource_id,      // host-0
                        alertResourceName = key.vitrage_resource_name ? key.vitrage_resource_name : '',  // host-0
                        alertResourceType = key.vitrage_resource_type ? key.vitrage_resource_type : '',  // nova.host
                        alertSeverity = key.severity,           //WARNING
                        alertOperationalSeverity = key.vitrage_operational_severity ? key.vitrage_operational_severity.toUpperCase() : key.vitrage_operational_severity,           //WARNING
                        alertState = key.state ? key.state.toUpperCase() : key.state,                 //Active
                        alertTimeStamp = $filter('vitrageDate')(key.update_timestamp, scope.dateFormat, scope.timezone),         //2015-12-01T12:46:41Z
                        alertType = key.vitrage_type,                   //nagios
                        alertVitrageId = key.vitrage_id;

                    var html = '';

                    html += '<div  style="padding: 10px; text-shadow: none; width: 378px; height: 115px; color: #44575e; clear:both"';
                    html += '>';

                    switch (alertState + '_' + alertOperationalSeverity) {
                        case 'ACTIVE_CRITICAL':
                            html += '<img src="' + STATIC_URL + 'dashboard/project/assets/bell_red_on.svg" style="width: 80px; height: 80px; padding-top: 10px;float: left;">';
                            break;
                        case 'ACTIVE_WARNING':
                            html += '<img src="' + STATIC_URL + 'dashboard/project/assets/bell_yellow_on.svg" style="width: 80px; height: 80px; padding-top: 10px;float: left;">';
                            break;
                        case 'ACTIVE_SEVERE':
                            html += '<img src="' + STATIC_URL + 'dashboard/project/assets/bell_orange_on.svg" style="width: 80px; height: 80px; padding-top: 10px;float: left;">';
                            break;
                        case 'ACTIVE_N/A':
                            html += '<img src="' + STATIC_URL + 'dashboard/project/assets/bell_gray_on.svg" style="width: 80px; height: 80px; padding-top: 10px;float: left;">';
                            break;
                        case 'ACTIVE_OK':
                            html += '<img src="' + STATIC_URL + 'dashboard/project/assets/bell_green_on.svg" style="width: 80px; height: 80px; padding-top: 10px;float: left;">';
                            break;
                        case 'INACTIVE_CRITICAL':
                            html += '<img src="' + STATIC_URL + 'dashboard/project/assets/bell_red_off.svg" style="width: 80px; height: 80px; padding-top: 10px;float: left;">';
                            break;
                        case 'INACTIVE_WARNING':
                            html += '<img src="' + STATIC_URL + 'dashboard/project/assets/bell_yellow_off.svg" style="width: 80px; height: 80px; padding-top: 10px;float: left;">';
                            break;
                        case 'INACTIVE_SEVERE':
                            html += '<img src="' + STATIC_URL + 'dashboard/project/assets/bell_orange_off.svg" style="width: 80px; height: 80px; padding-top: 10px;float: left;">';
                            break;
                        case 'INACTIVE_N/A':
                            html += '<img src="' + STATIC_URL + 'dashboard/project/assets/bell_gray_off.svg" style="width: 80px; height: 80px; padding-top: 10px;float: left;">';
                            break;
                        case 'INACTIVE_OK':
                            html += '<img src="' + STATIC_URL + 'dashboard/project/assets/bell_green_off.svg" style="width: 80px; height: 80px; padding-top: 10px;float: left;">';
                            break;
                        default:
                            html += '<img src="' + STATIC_URL + 'dashboard/project/assets/bell_yellow_on.svg" style="width: 80px; height: 80px; padding-top: 10px;float: left;">';
                            break;
                    }

                    html += '<div style="height: 90px; width: 2px; background: #656a70; float: left; margin: 5px 10px 0px 3px;"></div>';
                    html += '<div>';
                    html += '<div style="line-height: 2em; padding-left: 10px;text-align: left">';
                    html += '<div style="font-weight: 600; font-size: 20px; color: #44575e; width:262px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="' + alertName + '">' + alertName + '</div>';
                    html += '<span style="font-weight: 400; color: #44575e;">' + alertResourceType + '</span>';
                    html += '<div>';
                    html += '<span style="font-weight: 600; color: #44575e;">Resource ID:</span>';
                    html += '<span style="font-weight: 400; padding-left: 5px; color: #44575e;">' + alertResourceId + '</span>';
                    html += '</div>';
                    html += '<div>';
                    html += '<span style="font-weight: 600; color: #44575e;">Type:</span>';
                    html += '<span style="font-weight: 400; padding-left: 5px; color: #44575e;">' + alertType + '</span>';
                    html += '</div>';
                    html += '<div style="font-weight: 400; color: #44575e; width:262px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + alertInfo + '</div>';
                    html += '<div style="font-weight: 400; color: #44575e;">' + alertTimeStamp + ' | ' + alertState + ' | ' + alertSeverity;
                    if (key.id == data.inspected_index) {
                        html += '<span style="float: right"><i title="Root cause analysis relative to this alert" style="font-size: 27px; color: #FFFFFF" class="fa fa-thumb-tack"></i></span>';
                    }
                    html += '</div>';


                    html += '</div></div></div>';

                    g.setNode(value, {
                        labelType: "html",
                        label: html,
                        rx: 26,
                        ry: 26,
                        padding: 0,
                        class: className
                    });
                });

                angular.forEach(data.links, function (key, value) {
                    g.setEdge(key.source, key.target, {
                        label: "",
                        width: 20
                    });
                });

                inner.call(render, g);

                //inner.selectAll(".clickable:not(.update)").on("click", function(d) {
                //  setSelected(d);
                //});

                setSelected(data.inspected_index);
            }
            var verticesLength = data.nodes.length;

            // Zoom and scale to fit
            var zoomScale = zoom.scale();
            var graphWidth = g.graph().width + 80;
            var graphHeight = g.graph().height + 40;
            var width = parseInt(svg.style("width").replace(/px/, ""));
            var height = parseInt(svg.style("height").replace(/px/, ""));
            zoomScale = Math.min(width / graphWidth, height / graphHeight)
            if (verticesLength < 3) {
                zoomScale /= 2;
            }
            else if (verticesLength < 5) {
                zoomScale /= 1.5;
            }

            var translate = [(width / 2) - ((graphWidth * zoomScale) / 2), (height / 2) - ((graphHeight * zoomScale) / 2)];
            zoom.translate(translate);
            zoom.scale(zoomScale);
            zoom.event(d3.select("#root-cause-analysis-graph svg"));
        }

        function centerGraph(newGraph) {
            cleanGraph();
            draw(scope.data, newGraph);
        }

        scope.$watch("data", function (newValue, oldValue) {
            if (scope.data) {
                createGraph(true);
            }
        });

        scope.onCenterGraph = function () {
            centerGraph(false);
        };
    }
}


