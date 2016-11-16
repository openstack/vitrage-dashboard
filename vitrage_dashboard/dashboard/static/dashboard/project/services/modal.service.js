(function() {
    'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .service('modalSrv', ModalSrv);

    ModalSrv.$inject = ['$modal'];

    function ModalSrv($modal) {
        var modalInstance = null;

        function show(modalOptions) {
            modalInstance = $modal.open(modalOptions);
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
