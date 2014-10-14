var towApp = angular.module('towApp', [
        'ngRoute', 'towControllers', 'towServices', 'ngCookies'
]);

towApp.config([
        '$routeProvider', function($routeProvider) {
            $routeProvider.when('/main', {
                templateUrl : 'partials/main.html',
                controller : 'mainController'
            }).otherwise({
                redirectTo : '/main'
            });
        }
]);