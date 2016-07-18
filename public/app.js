var dtp = angular.module('dtp', ['ngRoute', 'angularMoment']);

dtp.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
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

dtp.factory('Title', function() {
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
        return $http.get('/auth/getUser')
            .then(function(res) {
                self.currentUser = res.data; // Keep current user variable up to date
                return res.data;
            })
    }
});

dtp.service('Forum', ['$http', 'Error', function($http, Error) {
    this.getPosts = function() {
        return $http.get('/api/forum')
            .then(function(res) {
                return res.data;
            }, function(res) {
                Error.error(res.data.error);
            });
    };
    this.newPost = function(post) {
        return $http.post('/api/forum', post)
            .then(function(res) {
                return res.data;
            }, function(res) {
                Error.error(res.data.error);
            })
    };
    this.getPost = function(id) {
        return $http.get('/api/forum/' + id)
            .then(function(res) {
                return res.data;
            }, function(res) {
                Error.error(res.data.error);
            })
    };
    this.updatePost = function(id, newContent) {
        return $http.put('/api/forum/' + id, newContent)
            .then(function(res) {
                return res;
            }, function(res) {
                Error.error(res.data.error);
            })
    };
}]);

dtp.controller('mainCtrl', ['$scope', 'Title', '$location', 'User', function($scope, Title, $location, User) {
    $scope.Title = Title;

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

    // Close side nav if screen size is less than 992px
    // Not perfect but it'll do. Most people don't resize their browsers...
    var getWindowSize = function() {
        if(window.innerWidth <= 992) {
            return true;
        } else {
            return false;
        }
    };
    $('.button-collapse').sideNav({
        closeOnClick: getWindowSize()
    });

}]);

dtp.controller('homeCtrl', ['$scope', 'Title', function($scope, Title) {
    $scope.Title = Title.setTitle('DTP');
}]);

dtp.controller('forumIndexCtrl', ['$scope', 'Title', 'User', 'Forum', 'Error',
    function($scope, Title, User, Forum, Error) {

        $scope.updatePosts = function() {
            Forum.getPosts()
                .then(function(posts) {
                    $scope.posts = posts;
                });
        };
        $scope.updatePosts();

        Title.setTitle('DTP - Forum');

        if(User.currentUser !== '') {
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
                            $scope.postTitle = '';
                            $scope.postContent = '';
                            $scope.updatePosts();
                        });
                }
            }
        };

        $(document).ready(function(){
            $('.modal-trigger').leanModal();
            $('.tooltipped').tooltip({delay: 800});
        });
}]);

dtp.controller('forumShowCtrl', ['$scope', 'Title', '$routeParams', 'User', 'Forum',
    function($scope, Title, $routeParams, User, Forum) {

        var id = $routeParams.postId;
        $scope.Title = Title.setTitle('DTP - Forum');

        if(User.currentUser !== '') {
            $scope.user = User.currentUser;
        }

        $scope.getPost = function() {
            Forum.getPost(id)
                .then(function(post) {
                    $scope.post = post;
                    $scope.postTitle = post.title;
                    $scope.postContent = post.content;
                    $scope.Title = Title.setTitle(post.title);
                });
        };
        $scope.getPost();

        $scope.openModal = function() {
            $('#content').trigger('autoresize');
        };

        $scope.updatePost = function() {
            var updatedPost = {
                title: $scope.postTitle,
                content: $scope.postContent,
                editedBy: $scope.user
            };
            Forum.updatePost(id, updatedPost)
                .then(function() {
                    $scope.getPost();
                })
        };

        $(document).ready(function(){
            $('.modal-trigger').leanModal();
            $('.tooltipped').tooltip();
        });
}]);