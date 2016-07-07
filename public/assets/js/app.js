var dtp = angular.module('dtp', ['ngRoute']);

dtp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'home.html',
            controller: 'homeCtrl',
            resolve: {
                user: function(User) {
                    return User.getUser();
                }
            }
        });
});

dtp.service('User', function($http) {
    this.getUser = function() {
        return $http.get('/getUser')
            .then(function(res) {
                return res.data;
            }, function(res) {
                console.log('Error retrieving user');
        })
    }
});

dtp.controller('homeCtrl', ['$scope', 'user', function($scope, user) {
    console.log(user);
    $scope.user = user;
}]);