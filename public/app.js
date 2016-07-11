var dtp = angular.module('dtp', ['ngRoute']);

// TODO: Better error handling

dtp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            title: 'DTP',
            templateUrl: 'home.html'
        })

        // Forum Routes
        .when('/forum', {
            title: 'DTP - Forum',
            templateUrl: 'forum/forum.html',
            controller: 'forumIndexCtrl',
            resolve: {
                // Provide posts on page load
                posts: function(Forum) {
                    return Forum.getPosts();
                }
            }
        })
});

dtp.run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);

dtp.service('Error', function() {
    // Split into different functions to be able to add icons to each message
    this.default = function(message, duration, callback) {
        duration = duration || 4000;

        Materialize.toast(message, duration, '', callback);
    };
    this.success = function(message, duration, callback) {
        message = '<i class="material-icons left">check</i>' + message;
        duration = duration || 4000;
        Materialize.toast(message, duration, 'toast-success', callback);
    };
    this.info = function(message, duration, callback) {
        message = '<i class="material-icons left">info</i>' + message;
        duration = duration || 4000;
        Materialize.toast(message, duration, 'toast-info', callback);
    };
    this.warning = function(message, duration, callback) {
        message = '<i class="material-icons left">warning</i>' + message;
        duration = duration || 4000;
        Materialize.toast(message, duration, 'toast-warning', callback);
    };
    this.error = function(message, duration, callback) {
        message = '<i class="material-icons left">error</i><strong>' + message + '</strong>';
        duration = duration || 4000;
        Materialize.toast(message, duration, 'toast-error', callback);
    };
});

dtp.service('User', function($http) {
    var self = this;
    this.currentUser = ''; // Saves network usage
    this.getUser = function() {
        return $http.get('/getUser')
            .then(function(res) {
                self.currentUser = res.data; // Keep current user variable up to date
                return res.data;
            })
    }
});

dtp.service('Forum', function($http) {
    this.getPosts = function() {
        return $http.get('/forum')
            .then(function(res) {
                return res.data;
            });
    };
    this.newPost = function(post) {
        return $http.post('/forum', post)
            .then(function(res) {
                return res.data;
            })
    };
});

dtp.controller('navCtrl', ['$scope', '$location', 'User', function($scope, $location, User) {
    if(User.currentUser === '') {
        User.getUser()
            .then(function(user) {
                if(user) {
                    $scope.user = user;
                }
            });
    } else {
        $scope.user = User.currentUser;
    }

    // Used to set the active nav button
    $scope.activeNav = function (viewLocation) {
        return viewLocation === $location.path();
    };
}]);

dtp.controller('forumIndexCtrl', ['$scope', 'User', 'posts', 'Forum', 'Error',
    function($scope, User, posts, Forum, Error) {
        if(User.currentUser === '') {
            User.getUser()
                .then(function(user) {
                    if(user) {
                        $scope.user = user;
                    }
                });
        } else {
            $scope.user = User.currentUser;
        }
        $scope.posts = posts;

        $scope.postTitle = '';
        $scope.postContent = '';

        $scope.createPost = function() {
            if($scope.user === undefined) {
                console.log('user error');
            } else {
                if($scope.postTitle || $scope.postContent === '') {
                    console.log('title & content error');
                } else {
                    var Post = {
                        title: $scope.postTitle,
                        content: $scope.postContent,
                        authour: $scope.user
                    };
                    Forum.newPost(Post)
                        .then(function(post) {
                            console.log(post);
                        });
                }
            }
        };

        // Initialize Modal
        $(document).ready(function(){
            $('.modal-trigger').leanModal();
            $('.tooltipped').tooltip({delay: 800});
        });
}]);