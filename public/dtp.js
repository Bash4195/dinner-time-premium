var dtp = angular.module('dtp', ['ngRoute', 'ngMaterial', 'angularMoment']);

dtp.config(function ($routeProvider, $locationProvider, $mdThemingProvider) {
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
            templateUrl: 'forum/category/forumCategoryIndex.html',
            controller: 'forumCategoryIndexCtrl'
        })

        .when('/forum/:categoryPath', {
            templateUrl: 'forum/post/forumPostIndex.html',
            controller: 'forumPostIndexCtrl'
        })
    
        .when('/forum/:categoryPath/:postId', {
            templateUrl: 'forum/post/forumPostShow.html',
            controller: 'forumPostShowCtrl'
        });

    // Themes
    $mdThemingProvider.theme('DTP')
        .primaryPalette('red')
        .accentPalette('orange')
        .warnPalette('red');

    $mdThemingProvider.setDefaultTheme('DTP');

        // Toast themes
    $mdThemingProvider.theme('success-toast');

    $mdThemingProvider.theme('error-toast');
});

dtp.factory('Title', function() {
    var title = 'DTP';
    var pageTitle = 'Dinner Time Premium';
    return {
        title: function() { return title; },
        pageTitle: function() { return pageTitle },
        setTitle: function(newTitle) { title = newTitle },
        setPageTitle: function(newTitle) { pageTitle = newTitle }
    };
});

dtp.service('Notify', ['$mdToast', function($mdToast) {
    this.success = function(message) {
        var success = $mdToast.simple(message)
            .position('top right')
            .theme('error-toast');
        $mdToast.show(success);
    };

    this.error = function(message) {
        var error = $mdToast.simple(message)
            .position('top right')
            .theme('error-toast');
        $mdToast.show(error);
    };
}]);

dtp.service('User', ['$http', 'Notify', function($http, Notify) {
    var self = this;
    this.currentUser = ''; // Saves network usage
    this.getCurrentUser = function() {
        return $http.get('/auth/getCurrentUser')
            .then(function(res) {
                self.currentUser = res.data; // Keep current user variable up to date
                return res.data;
            }, function(res) {
                Notify.error(res.data.error || 'Failed to retrieve your user information');
            })
    };
    this.getOnlineUsers = function() {
        return $http.get('/api/loggedInUsers')
            .then(function(res) {
                return res.data;
            }, function(res) {
                Notify.error(res.data.error);
            })
    };
    this.updateOnlineStatus = function(id, status) {
        return $http.post('/api/status', {id: id, onlineStatus: status})
            .then(function(res) {
                return res.data;
            }, function(res) {
                Notify.error(res.data.error);
            })
    }
}]);

dtp.service('Rest', ['$http', 'Notify', function($http, Notify) {
    // INDEX
    this.getThings = function(path) {
        return $http.get(path)
            .then(function(res) {
                return res.data;
            }, function(res) {
                if(res.data.error) {
                    Notify.error(res.data.error);
                } else {
                    Notify.error('Something went wrong while processing your request');
                }
            });
    };
    // CREATE
    this.newThing = function(path, newThing) {
        return $http.post(path, newThing)
            .then(function(res) {
                return res.data;
            }, function(res) {
                if(res.data.error) {
                    Notify.error(res.data.error);
                } else {
                    Notify.error('Something went wrong while processing your request');
                }
            })
    };
    // SHOW
    this.getThing = function(path) {
        return $http.get(path)
            .then(function(res) {
                return res.data;
            }, function(res) {
                if(res.data.error) {
                    Notify.error(res.data.error);
                } else {
                    Notify.error('Something went wrong while processing your request');
                }
            })
    };
    // UPDATE
    this.updateThing = function(path, updatedThing) {
        return $http.put(path, updatedThing)
            .then(function(res) {
                return res.data;
            }, function(res) {
                if(res.data.error) {
                    Notify.error(res.data.error);
                } else {
                    Notify.error('Something went wrong while processing your request');
                }
            })
    };
    // DELETE
    this.deleteThing = function(path) {
        return $http.delete(path)
            .then(function(res) {
                return res.data;
            }, function(res) {
                if(res.data.error) {
                    Notify.error(res.data.error);
                } else {
                    Notify.error('Something went wrong while processing your request');
                }
            })
    };
}]);

// Runs anytime any page loads up for the first time.
// Ex. refresh or from external link. Not Angular routing
// Used for the nav and anything on all pages
dtp.controller('mainCtrl', ['$scope', 'Title', '$timeout', '$interval', '$document', '$window', '$http', '$location', 'User', '$mdSidenav', '$mdMedia',
function($scope, Title, $timeout, $interval, $document, $window, $http, $location, User, $mdSidenav, $mdMedia) {
    $scope.Title = Title;

    $scope.user = null;
    $scope.$mdMedia = $mdMedia;

    $scope.gotOnlineUsers = false;

    if(User.currentUser === '') {
        User.getCurrentUser()
            .then(function(user) {
                if(user) {
                    $scope.user = user;
                    // When user logs in start checking for inactivity
                    onInactive();
                    User.updateOnlineStatus($scope.user._id, 'Online');
                    $scope.user.onlineStatus = 'Online';
                    // On refresh or browser close, set user status to away
                    angular.element($window).bind("beforeunload", function() {
                        User.updateOnlineStatus($scope.user._id, 'Away');
                        $scope.user.onlineStatus = 'Away';
                    });
                }
            });
    } else {
        // If the user comes back, set status to online and watch for inactivity
        $scope.user = User.currentUser;
        User.updateOnlineStatus($scope.user._id, 'Online');
        $scope.user.onlineStatus = 'Online';
        onInactive();

        angular.element($window).bind("beforeunload", function() {
            User.updateOnlineStatus($scope.user._id, 'Away');
            $scope.user.onlineStatus = 'Away';
        });
    }

    getOnlineUsers();
    $interval(function() { // Update online user list every 5 minutes
        getOnlineUsers();
    }, 300000);

    // Side navs
    $scope.lockLeft = true;
    $scope.lockOnlineUsers = true;

    $scope.toggleLeft = function() {
        $mdSidenav('left').toggle();
    };

    $scope.toggleOnlineUsers = function() {
        $mdSidenav('onlineUsers').toggle();
        if($mdSidenav('onlineUsers').isOpen()) {
            getOnlineUsers();
        }
    };

    $scope.toggleLockOnlineUsers = function() {
        $scope.lockOnlineUsers = !$scope.lockOnlineUsers;
        if($scope.lockOnlineUsers) {
            getOnlineUsers();
        }
    };

    $scope.toggleLeftAndOnlineUsers = function() {
        $scope.toggleLeft();
        $scope.toggleOnlineUsers();
    };

    function getOnlineUsers() {
        $scope.gotOnlineUsers = false; // Used to show loading circle until function completes
        User.getOnlineUsers()
            .then(function(users) {
                $scope.onlineUsers = users;
                $scope.gotOnlineUsers = true;
            })
    }

    // Used to set the active nav button
    $scope.activeNav = function (path) {
        return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    };

    // Set user status to away after 10 minutes
    // This function can also log users out after 30 minutes.
    // In case we want to add it back in the future
    function onInactive() {
        // Timeout timer value in milliseconds
        // var timeout = 1800000;
        // var warningTimeout = 1200000;
        var awayStatusTimeout = 600000;
        // var timeBetween = timeout - warningTimeout;
        // var loggedOut = false;

        // Start a timeout
        // var logoutTimer = $timeout(function(){ logoutUser() }, timeout);
        // var warningTimer = $timeout(function() { warnUser() }, warningTimeout);
        var awayStatusTimer = $timeout(function() { setUserAway() }, awayStatusTimeout);

        var bodyElement = angular.element($document);
        angular.forEach(['keydown', 'keyup', 'click', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'scroll', 'focus'],
            function(eventName) {
                bodyElement.bind(eventName, function () {
                    // If logged out is false, reset the timer
                    // if(!loggedOut) {
                    //     $scope.reset = true; // For the warning dialog
                    resetTimers();
                    // }
                });
            });

        function setUserAway() {
            User.updateOnlineStatus($scope.user._id, 'Away');
            $scope.user.onlineStatus = 'Away';
        }

        // function warnUser() {
        //     $mdDialog.show({
        //         clickOutsideToClose: true,
        //         fullscreen: true,
        //         scope: $scope,
        //         preserveScope: true,
        //         contentElement: '#logoutWarning',
        //         controller: function DialogController($scope, $mdDialog) {
        //             $scope.timeLeft = timeBetween + 1000; // Extra second because tick runs immediately
        //             $scope.reset = false;
        //             var tick = function() {
        //                 if($scope.timeLeft > 0) {
        //                     if($scope.reset) {
        //                         $interval.cancel(timeLeftTimer);
        //                         $timeout(function() {
        //                             $mdDialog.cancel();
        //                         }, 2000)
        //                     } else {
        //                         $scope.timeLeft = $scope.timeLeft - 1000;
        //                     }
        //                 }
        //             };
        //             tick();
        //             var timeLeftTimer =  $interval(tick, 1000);
        //
        //             $scope.closeDialog = function() {
        //                 $mdDialog.cancel();
        //             }
        //         }
        //     });
        // }

        // function logoutUser() {
        //     $http.get('/auth/logout')
        //         .then(function() {
        //             $timeout.cancel(logoutTimer);
        //             $timeout.cancel(warningTimer);
        //             loggedOut = true;
        //         });
        //
        //     // Reset user values
        //     User.currentuser = '';
        //     $scope.user = null;
        //     getOnlineUsers();
        // }

        function resetTimers() {
            /// Stop the pending timers
            // $timeout.cancel(logoutTimer);
            // $timeout.cancel(warningTimer);
            $timeout.cancel(awayStatusTimeout);

            if($scope.user.onlineStatus == 'Away') {
                User.updateOnlineStatus($scope.user._id, 'Online');
                $scope.user.onlineStatus = 'Online';
            }

            /// Reset the timers
            // logoutTimer = $timeout(function(){ logoutUser() }, timeout);
            // warningTimer = $timeout(function() { warnUser() }, warningTimeout);
            awayStatusTimer = $timeout(function() { setUserAway() }, awayStatusTimeout);
        }
    }
}]);

dtp.controller('homeCtrl', ['$scope', 'Title', function($scope, Title) {
    Title.setTitle('DTP');
    Title.setPageTitle('Dinner Time Premium');
}]);

// dtp.controller('userIndexCtrl', ['$scope', 'Title', 'User', '$routeParams', '$filter', function($scope, Title, User, $routeParams, $filter) {
//     var id = $routeParams.userId;
//
//     Title.setTitle('User Profile');
//
//     if(User.currentUser !== '') {
//         $scope.user = User.currentUser;
//     }
//
//     $scope.getUserProfile = function() {
//         User.getUser(id)
//             .then(function(user) {
//                 $scope.userProfile = user;
//                 Title.setTitle(user.name + '\'s Profile');
//                 // Have to do this to display online/offline text
//                 if(user.isOnline) {
//                     $scope.onlineStatus = 'Online';
//                 } else {
//                     $scope.onlineStatus = 'Offline';
//                 }
//                 // Age will display properly based on birthday if one is provided
//                 // Age may not be saved properly to the database, but will display properly regardless
//                 if($scope.userProfile.birthday) {
//                     $scope.userProfile.age = getAge($scope.userProfile.birthday);
//                 }
//                 $scope.userProfile.birthday = $filter('date')($scope.userProfile.birthday, 'dd MMMM, yyyy');
//             })
//     };
//
//     $scope.getUserProfile();
//
//     $scope.editing = false;
//
//     $scope.editProfile = function() {
//         $scope.editing = true;
//         Materialize.updateTextFields();
//     };
//
//     $scope.saveProfile = function() {
//         var birthday = $('#birthday').val();
//         if(birthday) {
//             birthday = Date.parse(birthday);
//             birthday = new Date(birthday).toISOString();
//         }
//
//         var userData = {
//             realName: $scope.userProfile.realName,
//             age: $scope.userProfile.age,
//             birthday: birthday,
//             location: $scope.userProfile.location,
//             occupation: $scope.userProfile.occupation,
//             bio: $scope.userProfile.bio
//         };
//
//         User.updateUser(id, userData)
//             .then(function() {
//                 $scope.editing = false;
//                 $scope.getUserProfile();
//             })
//     };
//
//     function getAge(dateString) {
//         var today = new Date();
//         var birthDate = new Date(dateString);
//         var age = today.getFullYear() - birthDate.getFullYear();
//         var m = today.getMonth() - birthDate.getMonth();
//         if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//             age--;
//         }
//         return age;
//     }
//
//     $(document).ready(function(){
//         $('.tooltipped').tooltip({delay: 800});
//         $('.datepicker').pickadate({
//             selectMonths: true, // Creates a dropdown to control month
//             selectYears: 99, // Creates a dropdown of 40 years to control year
//             max: moment().year(moment().year()).toDate()
//         });
//     });
// }]);

dtp.controller('forumCategoryIndexCtrl', ['$scope', 'Title', 'User', 'Rest', 'Notify', '$mdDialog', '$location',
function($scope, Title, User, Rest, Notify, $mdDialog, $location) {

    Title.setTitle('DTP - Forum');
    Title.setPageTitle('Forum');

    if(User.currentUser !== '') {
        $scope.user = User.currentUser;
    }
    
    $scope.gotCategories = false;

    function getCategories() {
        $scope.gotCategories = false;
        Rest.getThings('/api/forum')
            .then(function(categories) {
                if(categories) {
                    $scope.categories = categories;
                    $scope.gotCategories = true;
                }
            })
    }
    getCategories();

    $scope.goToCategory = function(path) {
        $location.path(path)
    };

    $scope.newCategory = {
        title: '',
        description: '',
        icon: ''
    };

    $scope.newCategoryDialog = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            fullscreen: true,
            scope: $scope,
            preserveScope: true,
            contentElement: '#createCategory',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                $scope.createCategory = function() {
                    if(!$scope.user) {
                        Notify.error('You must be logged in to create a category');
                        $mdDialog.hide();
                    } else if($scope.newCategory.title === '') {
                        Notify.error('A category needs a title!');
                    } else if($scope.newCategory.icon === '') {
                        Notify.error('A category needs an icon!');
                    } else if($scope.newCategory.description === '') {
                        Notify.error('A category needs a description!');
                    } else {
                        $mdDialog.hide();
                        var catPath = '/forum/' + $scope.newCategory.title.toLowerCase();
                        var newCategory = {
                            title: $scope.newCategory.title,
                            description: $scope.newCategory.description,
                            icon: $scope.newCategory.icon,
                            path: catPath,
                            createdBy: $scope.user
                        };
                        Rest.newThing('/api/forum', newCategory)
                            .then(function() {
                                $scope.newCategory = {
                                    title: '',
                                    description: '',
                                    icon: ''
                                };
                                getCategories();
                            });
                    }
                };
            }
        });
    };
    
    $scope.editingCategory = {
        title: '',
        description: '',
        icon: ''
    };

    $scope.editCategoryDialog = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            fullscreen: true,
            scope: $scope,
            preserveScope: true,
            contentElement: '#editCategory',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                $scope.updateCategory = function() {
                    if(!$scope.user) {
                        Notify.error('You must be logged in to edit a category');
                        $mdDialog.hide();
                    } else if($scope.editingCategory.title === '') {
                        Notify.error('A category needs a title!');
                    } else if($scope.editingCategory.description === '') {
                        Notify.error('A category needs a description!');
                    } else if($scope.editingCategory.icon === '') {
                        Notify.error('A category needs an icon!');
                    } else {
                        $mdDialog.hide();
                        var updatedCategory = {
                            title: $scope.editingCategory.title,
                            description: $scope.editingCategory.description,
                            icon: $scope.editingCategory.icon,
                            editedBy: $scope.user
                        };
                        Rest.updateThing('/api/forum/' + $scope.editingCategory._id, updatedCategory)
                            .then(function() {
                                $scope.editingCategory = {
                                    title: '',
                                    description: '',
                                    icon: ''
                                };
                                getCategories();
                            });
                    }
                };
            }
        });
    };

    $scope.confirmDeleteCategory = function() {
        $mdDialog.show({
            scope: $scope,
            preserveScope: true,
            contentElement: '#deleteCategory',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                if(!$scope.user) {
                    Notify.error('You must be logged in to delete a category');
                    $mdDialog.hide();
                } else {
                    $scope.deleteCategory = function() {
                        $mdDialog.hide();
                        Rest.deleteThing('/api/forum/' + $scope.editingCategory._id)
                            .then(function() {
                                getCategories();
                            })
                    };
                }
            }
        });
    };
}]);

dtp.controller('forumPostIndexCtrl', ['$scope', 'Title', 'User', 'Rest', 'Notify', '$mdDialog', '$routeParams', '$location',
function($scope, Title, User, Rest, Notify, $mdDialog, $routeParams, $location) {

    var categoryPath = $routeParams.categoryPath;

    if(User.currentUser !== '') {
        $scope.user = User.currentUser;
    }

    $scope.gotPosts = false;

    function getPosts() {
        $scope.gotPosts = false;
        Rest.getThings('/api/forum/' + categoryPath)
            .then(function(res) {
                $scope.posts = res.posts;
                $scope.category = res.category;
                $scope.gotPosts = true;

                Title.setTitle($scope.category.title);
                Title.setPageTitle($scope.category.title);
            })
    }
    getPosts();
    
    $scope.newPost = {
        title: '',
        content: ''
    };

    $scope.newPostDialog = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            fullscreen: true,
            scope: $scope,
            preserveScope: true,
            contentElement: '#createPost',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                $scope.createPost = function() {
                    if(!$scope.user) {
                        Notify.error('You must be logged in to create a post');
                        $mdDialog.hide();
                    } else if(!$scope.newPost.title) {
                        Notify.error('Your post needs a title!');
                    } else if(!$scope.newPost.content) {
                        Notify.error('Your post needs some content');
                    } else {
                        $mdDialog.hide();
                        var newPost = {
                            title: $scope.newPost.title,
                            content: $scope.newPost.content,
                            authour: $scope.user
                        };
                        Rest.newThing('/api/forum/' + categoryPath, newPost)
                            .then(function() {
                                $scope.newPost = {
                                    title: '',
                                    content: ''
                                };
                                getPosts();
                            });
                    }
                };
            }
        });
    };

    $scope.goToPost = function(id) {
        $location.path('/forum/' + categoryPath + '/' + id);
    };
}]);

dtp.controller('forumPostShowCtrl', ['$scope', 'Title', 'User', 'Rest', 'Notify', '$mdDialog', '$routeParams', '$location',
function($scope, Title, User, Rest, Notify, $mdDialog, $routeParams, $location) {

    var categoryPath = $routeParams.categoryPath;
    var postId = $routeParams.postId;

    Title.setTitle('DTP - Forum');
    Title.setPageTitle('DTP - Forum');

    if(User.currentUser !== '') {
        $scope.user = User.currentUser;
    }

    function getPost() {
        Rest.getThing('/api/forum/' + categoryPath + '/' + postId)
            .then(function(res) {
                $scope.post = res;
            })
    }
    getPost();

    function getRecentPosts() {
        Rest.getThings('/api/forum/recentPosts')
            .then(function(res) {
                $scope.recentPosts = res;
            })
    }
    getRecentPosts();

    $scope.editPostDialog = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            fullscreen: true,
            scope: $scope,
            preserveScope: true,
            contentElement: '#editPost',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                $scope.updatePost = function() {
                    if(!$scope.user) {
                        Notify.error('You must be logged in to edit a post');
                        $mdDialog.hide();
                    } else if($scope.post.title === '') {
                        Notify.error('A post needs a title!');
                    } else if($scope.post.content === '') {
                        Notify.error('A post needs content!');
                    } else {
                        $mdDialog.hide();
                        var updatedPost = {
                            title: $scope.post.title,
                            content: $scope.post.content,
                            editedBy: $scope.user
                        };
                        Rest.updateThing('/api/forum/' + categoryPath + '/' + $scope.post._id, updatedPost)
                            .then(function() {
                                getPost();
                            });
                    }
                };
            }
        });
    };

    $scope.confirmDeletePost = function() {
        $mdDialog.show({
            scope: $scope,
            preserveScope: true,
            contentElement: '#deletePost',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                $scope.deletePost = function() {
                    if(!$scope.user) {
                        Notify.error('You must be logged in to delete a post');
                        $mdDialog.hide();
                    } else{
                        $mdDialog.hide();
                        Rest.deleteThing('/api/forum/' + categoryPath + '/' + $scope.post._id)
                            .then(function() {
                                $location.path('/forum/' + categoryPath);
                            })
                    }
                };
            }
        });
    };
}]);