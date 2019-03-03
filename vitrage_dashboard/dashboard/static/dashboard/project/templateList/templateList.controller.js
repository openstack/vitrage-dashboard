(function () {
    'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .controller('TemplateListController', TemplateListController);

    TemplateListController.$inject = ['$scope', '$interval', 'modalSrv', 'timeSrv', 'vitrageTopologySrv'];

    function TemplateListController($scope, $interval, modalSrv, timeSrv, vitrageTopologySrv) {
        var templateList = this;
        templateList.templates = [];
        templateList.itemplates = [];
        $scope.STATIC_URL = STATIC_URL;
        templateList.templates = [];
        templateList.$interval = $interval;
        templateList.checkboxAutoRefresh = true;
        templateList.templateInterval;
        templateList.timezone = timeSrv.getHorizonTimezone();
        templateList.dateFormat = timeSrv.longDateFormat;
        var path = document.location.pathname;
        $scope.admin = path.indexOf('admin') > 0;

        getData();
        startCollectData();

        function startCollectData() {
            if (angular.isDefined(templateList.templateInterval)) return;
            templateList.templateInterval = templateList.$interval(getData, 5000);
        }

        function stopCollectData() {
            if (angular.isDefined(templateList.templateInterval)) {
                templateList.$interval.cancel(templateList.templateInterval);
                templateList.templateInterval = undefined;
            }
        }

        $scope.$on('$destroy', function () {
            templateList.stopCollectData();
        });

        templateList.autoRefreshChanged = function () {
            if (templateList.checkboxAutoRefresh) {
                getData();
                startCollectData();
            } else {
                stopCollectData();
            }
        };

        templateList.refreshTemplates = function () {
            getData();
        }

        templateList.closeModal = function () {
            if (templateList.file) {
                delete templateList.file.name;
            }
            modalSrv.dismiss();
        }

        templateList.submitModal = function () {
            modalSrv.close();
        }


        function getData() {
            vitrageTopologySrv.getTemplates('all').then(function (result) {
                templateList.templates = result.data;
            });

            templateList.onShowClick = function (template) {
                var modalOptions = {
                    animation: true,
                    templateUrl: STATIC_URL + 'dashboard/project/components/template/templateContainer.html',
                    controller: 'TemplateContainerController',
                    windowClass: 'app-modal-window',
                    resolve: {
                        template: function () {
                            return template;
                        }
                    }
                };

                modalSrv.show(modalOptions);
            }
            templateList.onAddClick = function () {
                var modalOptions = {
                    animation: true,
                    templateUrl: STATIC_URL + 'dashboard/project/components/addTemplate/addTemplateContainer.html',
                    controller: 'AddTemplateContainerController',
                    windowClass: 'app-modal-window'

                };

                modalSrv.show(modalOptions);
            }

            templateList.onDeleteClick = function (template) {
                vitrageTopologySrv.deleteTemplate(template.uuid).then(function (result) {
                    getData();
                })
                    .catch(function () {
                        horizon.toast.add("error", gettext("Unable to delete template"));
                    });
            }
        }

        $scope.$on('autoRefresh', function () {
                templateList.autoRefreshChanged();
                console.log('inside ON');
            }
        );
    }

})();

