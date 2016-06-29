var dtp = angular.module('dtp', ['ngRoute', 'ngMaterial']);

dtp.config(function($routeProvider, $mdThemingProvider) {
    $routeProvider.when('/', {
        templateUrl: 'home.html'
    })
});