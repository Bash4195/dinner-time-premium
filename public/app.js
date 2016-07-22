var dtp = angular.module('dtp', ['ngRoute', 'ngSanitize', 'angularMoment']);

dtp.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            templateUrl: 'home.html',
            controller: 'homeCtrl'
        })
            
        //User Routes
        .when('/user/:userId', {
            templateUrl: 'user/userIndex.html',
            controller: 'userIndexCtrl'
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

dtp.service('Notify', function() {
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

dtp.service('User', function($http, Notify) {
    var self = this;
    this.currentUser = ''; // Saves network usage
    this.getLoggedInUser = function() {
        return $http.get('/auth/getLoggedInUser')
            .then(function(res) {
                self.currentUser = res.data; // Keep current user variable up to date
                return res.data;
            })
    };
    this.getUser = function(id) {
        return $http.get('/api/user/' + id)
            .then(function(res) {
                return res.data;
            }, function(res) {
                Notify.error(res.data.error);
            })
    };

    this.updateUser = function(id, userData) {
        return $http.put('/api/user/' + id, userData)
            .then(function(res) {
                return res;
            }, function(res) {
                Notify.error(res.data.error);
            })
    }
});

dtp.service('Forum', ['$http', 'Notify', function($http, Notify) {
    this.getPosts = function() {
        return $http.get('/api/forum')
            .then(function(res) {
                return res.data;
            }, function(res) {
                Notify.error(res.data.error);
            });
    };
    this.newPost = function(post) {
        return $http.post('/api/forum', post)
            .then(function(res) {
                return res.data;
            }, function(res) {
                Notify.error(res.data.error);
            })
    };
    this.getPost = function(id) {
        return $http.get('/api/forum/' + id)
            .then(function(res) {
                return res.data;
            }, function(res) {
                Notify.error(res.data.error);
            })
    };
    this.updatePost = function(id, newContent) {
        return $http.put('/api/forum/' + id, newContent)
            .then(function(res) {
                return res;
            }, function(res) {
                Notify.error(res.data.error);
            })
    };
    this.deletePost = function(id) {
        return $http.delete('/api/forum/' + id)
            .then(function(res) {
                return res;
            }, function(res) {
                Notify.error(res.data.error);
            })
    }
}]);

// Runs anytime any page loads up for the first time.
// Ex. refresh or from external link. Not Angular routing
dtp.controller('mainCtrl', ['$scope', 'Title', '$location', 'User', function($scope, Title, $location, User) {
    $scope.Title = Title;

    if(User.currentUser === '') {
        User.getLoggedInUser()
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
    Title.setTitle('DTP');
}]);

dtp.controller('userIndexCtrl', ['$scope', 'Title', 'User', '$routeParams', '$filter', function($scope, Title, User, $routeParams, $filter) {
    var id = $routeParams.userId;
    
    Title.setTitle('User Profile');

    if(User.currentUser !== '') {
        $scope.user = User.currentUser;
    }

    $scope.getUserProfile = function() {
        User.getUser(id)
            .then(function(user) {
                $scope.userProfile = user;
                Title.setTitle(user.name + '\'s Profile');
                // Have to do this to display online/offline text
                if(user.isOnline) {
                    $scope.onlineStatus = 'Online';
                } else {
                    $scope.onlineStatus = 'Offline';
                }
                // Age will display properly based on birthday if one is provided
                // Age may not be saved properly to the database, but will display properly regardless
                if($scope.userProfile.birthday) {
                    $scope.userProfile.age = getAge($scope.userProfile.birthday);
                }
                $scope.userProfile.birthday = $filter('date')($scope.userProfile.birthday, 'dd MMMM, yyyy');
            })
    };

    $scope.getUserProfile();
    
    $scope.editing = false;
    
    $scope.editProfile = function() {
        $scope.editing = true;
        Materialize.updateTextFields();
    };

    $scope.saveProfile = function() {
        var birthday = $('#birthday').val();
        birthday = Date.parse(birthday);
        birthday = new Date(birthday).toISOString();
        
        var userData = {
            realName: $scope.userProfile.realName,
            age: $scope.userProfile.age,
            birthday: birthday,
            location: $scope.userProfile.location,
            occupation: $scope.userProfile.occupation,
            bio: $scope.userProfile.bio
        };
        
        User.updateUser(id, userData)
            .then(function() {
                $scope.editing = false;
                $scope.getUserProfile();
            })
    };

    function getAge(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    $(document).ready(function(){
        $('.tooltipped').tooltip({delay: 800});
        $('.datepicker').pickadate({
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 99, // Creates a dropdown of 40 years to control year
            max: moment().year(moment().year()).toDate()
        });
    });
}]);

dtp.controller('forumIndexCtrl', ['$scope', 'Title', 'User', 'Forum', 'Notify',
    function($scope, Title, User, Forum, Notify) {

        $scope.updatePosts = function() {
            Forum.getPosts()
                .then(function(posts) {
                    $scope.posts = posts;
                })
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
                Notify.error('You must be logged in to create a post');
                $('#createPostModal').closeModal();
            } else {
                if($scope.postTitle === '') {
                    Notify.error('Your post needs a title!');
                } else
                if($scope.postContent === '') {
                    Notify.error('The content field is required');
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

dtp.controller('forumShowCtrl', ['$scope', 'Title', '$routeParams', 'User', 'Forum', '$location',
    function($scope, Title, $routeParams, User, Forum, $location) {

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

        $scope.deletePost = function() {
            Forum.deletePost(id)
                .then(function() {
                    $location.path('/forum');
                })
        };

        $(document).ready(function(){
            $('.modal-trigger').leanModal();
            $('.tooltipped').tooltip();
        });
}]);