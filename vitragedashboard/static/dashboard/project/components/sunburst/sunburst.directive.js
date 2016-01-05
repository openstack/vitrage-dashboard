angular
    .module('horizon.dashboard.project.vitrage')
    .directive('hzSunburst', hzSunburst);

function hzSunburst() {
    var directive = {
        link: link,
        scope: {
            name: '@',
            data: '=',
            selected: '='
        },
        templateUrl: STATIC_URL+'dashboard/project/components/sunburst/sunburst.html',
        restrict: 'E'
    };
    return directive;

    function link(scope, element, attrs) {

        /*console.log('ELEMENT HEIGHT: ',element[0].parentElement.clientHeight);
        console.log('ELEMENT Width: ',element[0].parentElement.clientWidth);*/

        var svg, path, partition, arc, x, y,
          width = 500,
          height = 500,
          radius = Math.min(width, height) / 2;

        x = d3.scale.linear()
          .range([0, 2 * Math.PI]);

        y = d3.scale.sqrt()
          .range([0, radius]);

        partition = d3.layout.partition()
          .value(function (d) {
              return d.size | 1000;
          });

        arc = d3.svg.arc()
          .startAngle(function (d) {
              return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
          })
          .endAngle(function (d) {
              return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
          })
          .innerRadius(function (d) {
              return Math.max(0, y(d.y));
          })
          .outerRadius(function (d) {
              return Math.max(0, y(d.y + d.dy));
          });

        scope.$watch('data', function (newValue, oldValue) {
            if (newValue && newValue != oldValue) {
                scope.selected = newValue;
                svg ? update() : init();
            }
        });


        function click(d) {
            scope.selected = d;

            console.log("Clicked: ", d.id, ': ', d.name);
            path.transition()
              .duration(750)
              .attrTween("d", arcTween(d));
        }

        // Interpolate the scales!
        function arcTween(d) {
            var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
              yd = d3.interpolate(y.domain(), [d.y, 1]),
              yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
            return function (d, i) {
                return i
                  ? function (t) {
                    return arc(d);
                }
                  : function (t) {
                    x.domain(xd(t));
                    y.domain(yd(t)).range(yr(t));
                    return arc(d);
                };
            };
        }

        function getColor(d) {
            switch (d.state) {
                case 'RUNNING':
                case 'AVAILABLE':
                    return '#87CE53';
                case 'ERROR':
                case 'UNAVAILABLE':
                case 'UNRECOGNIZED':
                case 'FAILURE':
                case 'UNSUPPORTED':
                    return '#FA3C3C';
                case 'SUSPENDED':
                case 'TERMINATED':
                case 'PAUSED':
                    return '#ffdf6c';
                case 'SUBOPTIMAL':
                    return 'darkorange';
                default:
                    //'TERMINATING', 'STARTING', 'CREATING', 'SUSPENDING', 'REBUILDING'
                    return 'lightgrey';
            }
        }

        function init() {
            svg = d3.select('#' + scope.name).append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("id", scope.name + '_svg')
              .append("g")
              .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");


            update();
        }

        function update() {
            // Enter
            svg.selectAll("path")
              .data(partition.nodes(scope.data), function (d) {
                  return d.id;
              })
              .enter().append("path")
              .attr("d", arc)
              .style("fill", function (d) {
                  return getColor(d);
              })
              .on("click", click)
              .each(function (d) {
                  this.x0 = d.x;
                  this.dx0 = d.dx;
              });

            // Exit
            svg.selectAll("path")
              .data(partition.nodes(scope.data), function (d) {
                  return d.id;
              })
              .attr("d", arc)
              .style("fill", function (d) {
                  return getColor(d);
              })
              .exit().remove();

            path = svg.selectAll("path");
        }

    }
}

/*
 //TODO:
 1. Animate when clicking on refresh data
 2. If we are in deep in the arcs, and new data arrive, get to the root
 3. Understand the update (enter & exit)

 http://d3js.org/
 http://knowledgestockpile.blogspot.co.uk/2012/01/understanding-selectall-data-enter.html
 * */
