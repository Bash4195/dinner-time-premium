var dtp = angular.module('dtp', ['ngRoute']);

// TODO: Configure flash messages
// TODO: Better error handling

dtp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'home.html'
        });
});

dtp.service('User', function($http) {
    this.getUser =  function() {
        return $http.get('/getUser')
            .then(function(res) {
                return res.data;
            })
    }
});

dtp.controller('navCtrl', ['$scope', 'User', function($scope, User) {
    function init() {
        User.getUser().then(function(user) {
            if(user) {
                $scope.user = user;
            }
        });
    }
    init();
}]);