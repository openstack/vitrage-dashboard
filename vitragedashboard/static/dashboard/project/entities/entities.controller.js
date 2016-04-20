(function () {
  'use strict';

  angular
    .module('horizon.dashboard.project.vitrage')
    .controller('EntitiesController', EntitiesController);

  EntitiesController.$inject = ['$scope', 'vitrageTopologySrv'];

  function EntitiesController($scope, vitrageTopologySrv) {

      this.model = {selected: {}};

      var _this = this;

      $scope.$on('graphItemClicked',function (event, data){
          //console.log('graphItemClicked', event, data);
          _this.selectedItem = data;
          event.stopPropagation();
          $scope.$digest();
      });

      this.setSelected = function(item) {
          //console.log('setSelected', item);
          this.model.selected = item;
      }

    vitrageTopologySrv.getTopology('graph')
        .then(function(res) {
          _this.graphData = res.data;
        })
  }

})();

