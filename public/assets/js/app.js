var dtp = angular.module('dtp', ['ngRoute']);

dtp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'home.html'
        });
});