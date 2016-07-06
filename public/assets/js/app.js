var dtp = angular.module('dtp', ['ngRoute']);

dtp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'home.html',
            controller: 'homeCtrl'
        });
});

dtp.controller('homeCtrl', ['$scope', function($scope) {
    
}]);