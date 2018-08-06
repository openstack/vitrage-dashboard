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
            return modalInstance;
        }

        //resolves the promise modalInstance.result
        function close() {
            if(modalInstance) {
                modalInstance.close();
                modalInstance = null;
            }
        }

        //rejects the promise modalInstance.result
        function dismiss() {
            if(modalInstance) {
                modalInstance.dismiss();
                modalInstance = null;
            }
        }

        return {
            show: show,
            close: close,
            dismiss: dismiss
        };
    }
})();
