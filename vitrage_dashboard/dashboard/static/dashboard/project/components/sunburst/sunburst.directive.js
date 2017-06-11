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
    templateUrl: STATIC_URL + 'dashboard/project/components/sunburst/sunburst.html',
    restrict: 'E'
  };
  return directive;

  function link(scope, element, attrs) {

    var svg, path, partition, arc,
      width = 500,
      height = 500,
      Df = {pad: 5, speed: 1000, width: width, height: height, radius: Math.min(width, height) / 2},
      fnX = d3.scale.linear().range([0, 2 * Math.PI]),
      fnY = d3.scale.pow().exponent(0.5).domain([0, 1]).range([0, Df.radius]),

    partition = d3.layout.partition()
      .value(function(d) {
        return d.size | 1000;
      });

    arc = d3.svg.arc()
      .startAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, fnX(d.x)));
      })
      .endAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, fnX(d.x + d.dx)));
      })
      .innerRadius(function (d) {
        return Math.max(0, fnY(d.y));
      })
      .outerRadius(function (d) {
        return Math.max(0, fnY(d.y + d.dy));
      });

    scope.$watch('data', function(newValue, oldValue) {
      if (newValue && newValue != oldValue) {
        cloneSelectedItem(newValue);
        svg ? update() : init();
      }
    });

    function click(d) {
      cloneSelectedItem(d);
      console.log('Clicked: ', scope.selected);
      scope.$emit('sunburstItemClicked', d);

      path.transition()
        .duration(750)
        .attrTween("d", arcTween(d));

      // TEXT ANIMATION
      svg.selectAll('text')
        .style('visibility', function (e) {
          return isParentOf(d, e) ? null : d3.select(this).style('visibility');
        })
        .transition().duration(Df.speed)  // makes the effect of fade-in / fade-out
        .attrTween('text-anchor', function (d) {
          return function () {
            return fnX(d.x + d.dx / 2) > Math.PI ? 'end' : 'start';
          };
        })
        .attrTween('transform', function (d) {
          return function () {
            var angle = fnX(d.x + d.dx / 2) * 180 / Math.PI - 90;

            return ['rotate(', angle, ')', //
              'translate(', fnY(d.y) + Df.pad, ')', //
              'rotate(', angle > 90 ? -180 : 0, ')'].join('');
          };
        })
        .style('fill-opacity', function (e) {
          return isParentOf(d, e) ? 1 : 1e-6;
        }) //
        .each('end', function (e) {
          d3.select(this).style('visibility', isParentOf(d, e) ? null : 'hidden');
        });
    }

    function cloneSelectedItem(d) {
      scope.selected = {id: d.id, name: d.name, state: d.vitrage_aggregated_state,vitrage_id: d.vitrage_id, type: d.vitrage_type};
    }

    // Interpolate the scales!
    function arcTween(d) {
      var xd = d3.interpolate(fnX.domain(), [d.x, d.x + d.dx]);
      var yd = d3.interpolate(fnY.domain(), [d.y, maxY(d)]);
      var yr = d3.interpolate(fnY.range(), [d.y ? 20 : 0, Df.radius]);

      return function (d) {
        return function (t) {
          fnX.domain(xd(t));
          fnY.domain(yd(t)).range(yr(t));
          return arc(d);
        };
      };
    }

    function maxY(d) {
      return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
    }

    function getColor(d) {
      if (d.vitrage_operational_state) {
        switch (d.vitrage_operational_state.toUpperCase()) {
          case 'ERROR':
          case 'DELETED':
            return '#BE0006';
            break;
          case 'SUBOPTIMAL':
            return '#FCD20E';
            break;
          case 'OK':
            return '#87CE53';
            break;
          case 'TRANSIENT':
            return '#97A560';
            break;
          case 'N/A':
            return '#AEAEAE';
            break;
          default:
            return '#D3D3D3';
        }
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
        .data(partition.nodes(scope.data), function(d) {
          return d.id;
        })
        .enter().append("path")
        .attr("d", arc)
        .style("fill", function(d) {
          return getColor(d);
        })
        .on("click", click)
        .each(function(d) {
          this.x0 = d.x;
          this.dx0 = d.dx;
        });

      svg.selectAll('text')
        .data(partition.nodes(scope.data), function (d) {
          return d.id;
        })
        .enter().append('text')
        .text(function(d) {
          return substringName(d);
        })
        .attr({
          'dy': '.2em',
          'text-anchor': function (d) {
            return fnX(d.x + d.dx / 2) > Math.PI ? 'end' : 'start';
          },
          'transform': function (d) {
            var angle, rotated;

            angle = fnX(d.x + d.dx / 2) * 180 / Math.PI - 90;
            rotated = (angle > 90 ? -180 : 0);

            return ['rotate(', angle, ')',
              'translate(', fnY(d.y) + Df.pad, ')',
              'rotate(', rotated, ')'].join('');
          }
        })
        .on("click", click);

      svg.selectAll('text')
        .append("svg:title").text(function(d){
        return createTooltipText(d);
      });

      // Exit
      svg.selectAll("path")
        .data(partition.nodes(scope.data), function(d) {
          return d.id;
        })
        .attr("d", arc)
        .style("fill", function(d) {
          return getColor(d);
        })
        .exit().remove();

      path = svg.selectAll("path");

      path.append("svg:title").text(function(d) {
          return createTooltipText(d);
        }
      );
    }

    function substringName(d){
      var name = d.name,
      dots = '...';

      if (name && name.length > 4) {
        name = d.name.substring(0, 4) + dots;
      }
      return name;
    }

    function isParentOf(p, c) {
      if (p === c) {
        return true;
      }
      if (p.children) {
        return p.children.some(function (d) {
          return isParentOf(d, c);
        });
      }
      return false;
    }

    function createTooltipText(d) {
      return d.name;
    }

  }
}
