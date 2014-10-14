var towServices = angular.module('towServices', [
    'ngResource'
]);

var host = getHost();

function getHost() {
    return window.location.protocol + '//' + window.location.host + '/miw-tow';
}
