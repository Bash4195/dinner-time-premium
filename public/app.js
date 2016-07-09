var dtp = angular.module('dtp', ['ngRoute']);

// TODO: Configure flash messages
// TODO: Better error handling

dtp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'home.html',
            title: 'DTP'
        })
        .when('/forum', {
            templateUrl: 'forum/forum.html',
            controller: 'forumCtrl',
            title: 'DTP - Forum'
        })
});

dtp.run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);

dtp.service('User', function($http) {
    var self = this;
    this.currentUser = '';
    this.getUser =  function() {
        return $http.get('/getUser')
            .then(function(res) {
                self.currentUser = res.data; // Keep current user variable up to date
                return res.data;
            })
    }
});

dtp.controller('navCtrl', ['$scope', '$location', 'User', function($scope, $location, User) {
    function init() {
        User.getUser().then(function(user) {
            if(user) { // Get user data if it exists
                $scope.user = user;
                User.currentUser = user;
            }
        });
    }
    init(); // Have to do this to get the user data properly

    // Used to set the active nav button
    $scope.activeNav = function (viewLocation) {
        return viewLocation === $location.path();
    };
}]);

dtp.controller('forumCtrl', ['$scope', 'User', function($scope, User) {
    if(User.currentUser !== '') {
        $scope.user = User.currentUser;
    }

    $(document).ready(function(){
        $('.collapsible').collapsible();
    });
}]);