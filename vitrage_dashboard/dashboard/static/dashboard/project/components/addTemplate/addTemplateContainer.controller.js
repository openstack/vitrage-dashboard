(function () {
    'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .controller('AddTemplateContainerController', AddTemplateContainerController);

    AddTemplateContainerController.$inject = ['$scope', 'modalSrv', 'vitrageTopologySrv', '$rootScope'];

    function AddTemplateContainerController($scope, modalSrv, vitrageTopologySrv, $rootScope) {

        $scope.STATIC_URL = STATIC_URL;
        $scope.status = {
            isopen: false
        };
        $scope.version = "";
        $scope.templateType = "";
        $scope.parameters = [];
        $scope.loading = false;
        $scope.templateContent = null;
        $scope.withParameters = false;
        $scope.uploading = false;

        $scope.addNewParameter = function () {
            $scope.parameters.push({key: '', value: ''});

        };
        $scope.removeParameter = function (element) {
            var index = $scope.parameters.indexOf(element);
            if (index > -1) {
                $scope.parameters.splice(index, 1);
            }
        };

        $scope.submitModal = function () {
            modalSrv.close();
        };


        $scope.closeModal = function () {
            modalSrv.close();
        };


        $scope.uploadFile = function (file, errFile) {

            if (file) {

                var ending = file.name.split('.').pop();
                if (ending !== 'yml' && ending !== 'yaml') {
                    horizon.toast.add("error", gettext("Invalid file type. Templates should be YAML files"));
                    delete file.name;
                    return;
                }
                $scope.file = file;

                var r = new FileReader();

                r.onload = function (e) {
                    $scope.uploading = true;
                    var tempVersion = JSON.stringify(e.target.result).match(/version: (\d+)/i);
                    $scope.withParameters = !!JSON.stringify(e.target.result).match("parameters:");
                    $scope.version = tempVersion ? tempVersion[1] : "1";
                    $scope.templateContent = e.target.result;

                };

                r.catch = function () {
                    $scope.uploading = false;
                    horizon.toast.add("error", gettext("Unable to read file"));
                    delete file.name;
                }
                try {
                    $scope.uploading = false;
                    r.readAsText(file);
                } catch (error) {
                    $scope.uploading = false;
                    horizon.toast.add("error", gettext("Unable to read file"));
                    delete file.name;
                    return;
                }
            }
        }
        $scope.submit = function () {

            $scope.loading = true;
            var file = $scope.file;
            var finalParameters = {};


            if ($scope.version === '1') {
                var e = document.getElementById("typeSelect");
                var type = e.options[e.selectedIndex].text.toLowerCase();
                if (type !== "standard" && type !== "definition" && type !== "equivalence") {
                    horizon.toast.add("error", gettext("Invalid type entered. Type is one of: standard, definition, equivalence"));
                    delete file.name;
                    $scope.loading = false;
                    $scope.closeModal();
                    return;
                }
            }

            $scope.parameters.forEach(function (parameter) {
                    finalParameters[parameter.key] = parameter.value;
                }
            );

            vitrageTopologySrv.validateTemplate($scope.templateContent, type, finalParameters).then(function (result) {
               if (!result || !result.data || !result.data.results || result.data.results.length === 0) {
                    horizon.toast.add("error", gettext('Template Validation Failed'));
                } else {
                    if (!(result.data.results[0]['status code'] === 0 || result.data.results[0]['status code'] === "")) {
                        horizon.toast.add("error", gettext(result.data.results[0].message));
                    } else {
                        vitrageTopologySrv.addTemplate($scope.templateContent, type, finalParameters).then(function (result) {

                            if (result.data[0].status === 'ERROR') {
                                horizon.toast.add("error", gettext(result.data[0]['status details']));
                            } else {
                                $scope.loading = false;
                                $rootScope.$broadcast('autoRefresh');

                            }

                        })
                            .catch(function () {
                                $scope.loading = false;
                                horizon.toast.add("error", gettext("Unable to add template"));
                                return;
                            });
                    }
                }

            }).catch(function (reason) {
                horizon.toast.add("error", gettext(reason));
            })
            $scope.closeModal();


        }


    }

})();
