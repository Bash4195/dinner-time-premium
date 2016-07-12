var dtp = angular.module('dtp', ['ngRoute']);

// TODO: Better error handling

dtp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'home.html',
            controller: 'homeCtrl'
        })

        // Forum Routes
        .when('/forum', {
            templateUrl: 'forum/forumIndex.html',
            controller: 'forumIndexCtrl'
        })

        .when('/forum/:postId', {
            templateUrl: 'forum/forumShow.html',
            controller: 'forumShowCtrl'
        })
});

dtp.factory('PageTitle', function() {
    var title = 'DTP';
    return {
        title: function() { return title; },
        setTitle: function(newTitle) { title = newTitle }
    };
});

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
        message = '<i class="material-icons left">error</i>' + message;
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

dtp.service('Forum', ['$http', 'Error', function($http, Error) {
    this.getPosts = function() {
        return $http.get('/forum')
            .then(function(res) {
                return res.data;
            }, function(res) {
                Error.error(res.data.error);
            });
    };
    this.newPost = function(post) {
        return $http.post('/forum', post)
            .then(function(res) {
                return res.data;
            }, function(res) {
                Error.error(res.data.error);
            })
    };
    this.getPost = function(id) {
        return $http.get('/forum/' + id)
            .then(function(res) {
                return res.data;
            }, function(res) {
                Error.error(res.data.error);
            })
    }
}]);

dtp.controller('navCtrl', ['$scope', 'PageTitle', '$location', 'User', function($scope, PageTitle, $location, User) {
    $scope.PageTitle = PageTitle;
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

dtp.controller('homeCtrl', ['$scope', 'PageTitle', function($scope, PageTitle) {
    $scope.PageTitle = PageTitle.setTitle('DTP');
}]);

dtp.controller('forumIndexCtrl', ['$scope', 'PageTitle', 'User', 'Forum', 'Error',
    function($scope, PageTitle, User, Forum, Error) {

        $scope.updatePosts = function() {
            Forum.getPosts()
                .then(function(posts) {
                    $scope.posts = posts;
                });
        };
        $scope.updatePosts();

        PageTitle.setTitle('DTP - Forum');

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

        $scope.postTitle = '';
        $scope.postContent = '';

        $scope.createPost = function() {
            if($scope.user === undefined) {
                Error.error('You must be logged in to create a post');
                $('#createPostModal').closeModal();
            } else {
                if($scope.postTitle === '') {
                    Error.error('Your post needs a title!');
                } else
                if($scope.postContent === '') {
                    Error.error('The content field is required');
                } else {
                    $('#createPostModal').closeModal();
                        var Post = {
                            title: $scope.postTitle,
                            content: $scope.postContent,
                            authour: $scope.user
                        };
                    Forum.newPost(Post)
                        .then(function(post) {
                            console.log(post);
                            $scope.postTitle = '';
                            $scope.postContent = '';
                            $scope.updatePosts();
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

dtp.controller('forumShowCtrl', ['$scope', 'PageTitle', '$routeParams', 'Forum', function($scope, PageTitle, $routeParams, Forum) {
    var id = $routeParams.postId;
    $scope.PageTitle = PageTitle.setTitle('DTP - Forum');

    $scope.getPost = function() {
        Forum.getPost(id)
            .then(function(post) {
                $scope.post = post;
                $scope.PageTitle = PageTitle.setTitle(post.title);
            });
    };
    $scope.getPost();
}]);