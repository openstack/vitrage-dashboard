angular.module('horizon.dashboard.project.vitrage')
    .filter('vitrageDate', vitrageDate);

function vitrageDate($filter, timeSrv){
    return function(text, format = timeSrv.longDateFormat, timezone = ''){
        var tempdate = '';
        if (text) {
            tempdate= new Date(text);
        }
        if (!timezone) {
            timezone = timeSrv.getHorizonTimezone();
        }
        return $filter('date')(tempdate, format, timezone);
    }
}
vitrageDate.$inject = ['$filter', 'timeSrv'];