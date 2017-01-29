(function() {
    'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .service('modalSrv', ModalSrv);

    ModalSrv.$inject = ['$uibModal'];

    function ModalSrv($uibModal) {
        var modalInstance = null;

        function show(modalOptions) {
            modalInstance = $uibModal.open(modalOptions);
        }

        function close() {
            if(modalInstance) {
                modalInstance.close();
                modalInstance = null;
            }
        }

        return {
            show: show,
            close: close
        }
    }
})();
