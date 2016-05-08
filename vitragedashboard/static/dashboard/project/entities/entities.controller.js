(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('EntitiesController', EntitiesController);

  EntitiesController.$inject = ['$scope', 'vitrageTopologySrv', '$interval'];

  function EntitiesController($scope, vitrageTopologySrv, $interval) {

      //this.$interval = $interval;
      this.model = {selected: {}};

      var _this = this,
          loadTime = 10000,
          errorCount = 0,
          loadInterval;

      $scope.$on('graphItemClicked',function (event, data){
          _this.selectedItem = data;
          event.stopPropagation();
          $scope.$digest();
      });

      this.setSelected = function(item) {
          this.model.selected = item;
      }

      loadData();

      function loadData() {
          vitrageTopologySrv.getTopology('graph')
              .then(function(res) {
                  var nodes = res.data.nodes,
                      links = res.data.links;

                  _.each(links, function(link) {
                      link.source = nodes[link.source];
                      link.target = nodes[link.target];
                  });


                  if (_this.graphData) {
                      mergeData(res.data);
                  } else {
                      _this.graphData = res.data;
                      _this.graphData.ts = Date.now();
                  }

                  errorCount = 0;
                  nextLoad();
              })
              .catch(function(res) {
                  nextLoad(++errorCount * 2 * loadTime);
              })
      }

      function nextLoad(mill) {
          mill = mill || loadTime;
          cancelNextLoad();
          loadInterval = $interval(loadData, mill);
      }

      function cancelNextLoad() {
          $interval.cancel(loadInterval);
      }

      function mergeData(data) {
          //temp mess with data
          /*var nodeIndex = rnd(0, data.nodes.length - 1);
          var nodeCount = (data.nodes.length - 1) - nodeIndex;
          var linkIndex = rnd(0, data.nodes.length - 1);
          var linkCount = (data.links.length - 1) - linkIndex;
          data.nodes.splice(nodeIndex, nodeCount);
          data.links.splice(linkIndex, linkCount);*/


          var graphNodes = $scope.vm.graphData.nodes,
              graphLinks = $scope.vm.graphData.links;

          if (graphNodes.length != data.nodes.length || graphLinks.length != data.links.length) {

              graphNodes.splice(0, graphNodes.length);
              graphLinks.splice(0, graphLinks.length);

              _.each(data.nodes, function(node) {
                  graphNodes.push(node);
              })

              _.each(data.links, function(link) {
                  graphLinks.push(link);
              })

              $scope.vm.graphData.ts = Date.now();
          }
      }

      /* utils */

      function rnd(min, max) {
          return Math.round(Math.random() * (max- min)) + min;
      }

      //var old = [{a: 111}, {a: 222}, {a: 333}, {a: 444}];
      //var newa = [{a:111}, {a: 444}, {a: 777}, {a: 999}];
      //var onlyInOld = onlyIn(old, newa, 'a');
      //var onlyInNew = onlyIn(newa, old, 'a');
      function onlyIn(a1, a2, prop) {
          prop = prop || 'id';
          return a1.filter(function(o1) {
              return a2.filter(function(o2) {
                      return o1[prop] === o2[prop];
                  }).length === 0;
          })
      }
  }

})();

