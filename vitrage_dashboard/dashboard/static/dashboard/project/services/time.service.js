(function() {
    'use strict';

    angular
        .module('horizon.dashboard.project.vitrage')
        .service('timeSrv', TimeSrv);

    function TimeSrv() {

        function getHorizonTimezone() {
            var timezone = horizon.cookies.get('django_timezone');
            if (timezone) {
                timezone = timezone.replace(/"/g,'');
            } else {
                timezone = 'UTC';
            }
            return moment.tz(timezone).format('ZZ');
        }

        return {
            getHorizonTimezone: getHorizonTimezone,
            longDateFormat: 'yyyy-MM-dd HH:mm:ss',
            rcaDateFormat: 'MM/dd/yyyy h:mma'
        };
    }
})();
