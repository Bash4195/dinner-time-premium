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

        .when('/forum/:categoryId', {
            templateUrl: 'forum/forumShow.html',
            controller: 'forumShowCtrl'
        });

    // Themes
    $mdThemingProvider.theme('DTP')
        .primaryPalette('red')
        .accentPalette('amber')
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
    this.newThing = function(path, newCategory) {
        return $http.post(path, newCategory)
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
    this.getThing = function(path, id) {
        return $http.get(path + id)
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
    this.updateThing = function(path, id, updatedCategory) {
        return $http.put(path + id, updatedCategory)
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
    this.deleteThing = function(path, id) {
        return $http.delete(path + id, id)
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
dtp.controller('mainCtrl', ['$scope', 'Title', '$timeout', '$interval', '$document', '$window', '$http', '$location', 'User', '$mdSidenav', '$mdMedia', '$mdDialog',
    function($scope, Title, $timeout, $interval, $document, $window, $http, $location, User, $mdSidenav, $mdMedia, $mdDialog) {
        $scope.Title = Title;

        $scope.user = null;
        $scope.$mdMedia = $mdMedia;

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
                    getOnlineUsers();
                });
        } else {
            // If the user comes back, set status to online and watch for inactivity
            $scope.user = User.currentUser;
            $scope.user.onlineStatus = 'Online';
            onInactive();
            getOnlineUsers();
        }

        $interval(function() {
            getOnlineUsers();
        }, 600000);

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
            User.getOnlineUsers()
                .then(function(users) {
                    $scope.onlineUsers = users;
                })
        }

        // Used to set the active nav button
        $scope.activeNav = function (path) {
            return ($location.path().substr(0, path.length) === path) ? 'active' : '';
        };

        // Log the user out after 30 minutes of inactivity
        function onInactive() {
            // Timeout timer value in milliseconds
            var timeout = 1800000;
            var warningTimeout = 1200000;
            var awayStatusTimeout = 600000;
            var timeBetween = timeout - warningTimeout;
            var loggedOut = false;

            // Start a timeout
            var logoutTimer = $timeout(function(){ logoutUser() }, timeout);
            var warningTimer = $timeout(function() { warnUser() }, warningTimeout);
            var awayStatusTimer = $timeout(function() { setUserAway() }, awayStatusTimeout);

            var bodyElement = angular.element($document);
            angular.forEach(['keydown', 'keyup', 'click', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'scroll', 'focus'],
                function(eventName) {
                    bodyElement.bind(eventName, function (e) {
                        // If logged out is false, reset the timer
                        if(!loggedOut) {
                            $scope.reset = true; // For the warning dialog
                            resetTimers(e)
                        }
                    });
                });

            function setUserAway() {
                User.updateOnlineStatus($scope.user._id, 'Away');
                $scope.user.onlineStatus = 'Away';
            }

            function warnUser() {
                $mdDialog.show({
                    clickOutsideToClose: true,
                    fullscreen: true,
                    scope: $scope,
                    preserveScope: true,
                    contentElement: '#logoutWarning',
                    controller: function DialogController($scope, $mdDialog) {
                        $scope.timeLeft = timeBetween + 1000; // Extra second because tick runs immediately
                        $scope.reset = false;
                        var tick = function() {
                            if($scope.timeLeft > 0) {
                                if($scope.reset) {
                                    $interval.cancel(timeLeftTimer);
                                    $timeout(function() {
                                        $mdDialog.cancel();
                                    }, 2000)
                                } else {
                                    $scope.timeLeft = $scope.timeLeft - 1000;
                                }
                            }
                        };
                        tick();
                        var timeLeftTimer =  $interval(tick, 1000);

                        $scope.closeDialog = function() {
                            $mdDialog.cancel();
                        }
                    }
                });
            }

            function logoutUser() {
                $http.get('/auth/logout')
                    .then(function() {
                        $timeout.cancel(logoutTimer);
                        $timeout.cancel(warningTimer);
                        loggedOut = true;
                    });

                // Reset user values
                User.currentuser = '';
                $scope.user = null;
                getOnlineUsers();
            }

            function resetTimers(e) {
                /// Stop the pending timers
                $timeout.cancel(logoutTimer);
                $timeout.cancel(warningTimer);
                $timeout.cancel(awayStatusTimeout);

                User.updateOnlineStatus($scope.user._id, 'Online');
                $scope.user.onlineStatus = 'Online';

                /// Reset the timers
                logoutTimer = $timeout(function(){ logoutUser() }, timeout);
                warningTimer = $timeout(function() { warnUser() }, warningTimeout);
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

        function getCategories() {
            Rest.getThings('/api/forum')
                .then(function(categories) {
                    if(categories) {
                        $scope.categories = categories;
                    }
                })
        }
        getCategories();

        $scope.goToCategory = function(path) {
            $location.path(path)
        };

        $scope.newCategory = null;

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
                    }
                }
            });
        };

        $scope.createCategory = function() {
            if($scope.user === undefined) {
                Notify.error('You must be logged in to create a post');
                $mdDialog.hide();
            } else if($scope.newCategory.title === '') {
                Notify.error('A category needs a title!');
            } else if($scope.newCategory.icon === '') {
                Notify.error('A category needs a description!');
            } else if($scope.newCategory.description === '') {
                Notify.error('A category needs an icon!');
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
                    .then(function(category) {
                        $scope.newCategory = null;
                        if($scope.categories) {
                            $scope.categories.push(category);
                        } else {
                            getCategories();
                        }
                    });
            }
        };
        
        $scope.editingCategory = null;

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
                    }
                }
            });
        };

        $scope.updateCategory = function() {
            if($scope.user === undefined) {
                Notify.error('You must be logged in to create a post');
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
                    updatedBy: $scope.user
                };
                Rest.updateThing('/api/forum/', $scope.editingCategory._id, updatedCategory)
                    .then(function(category) {
                        $scope.editingCategory = null;
                        getCategories();
                    });
            }
        };

        $scope.confirmDelete = function() {
            $mdDialog.show({
                scope: $scope,
                preserveScope: true,
                contentElement: '#deleteCategory',
                controller: function DialogController($scope, $mdDialog) {
                    $scope.closeDialog = function() {
                        $mdDialog.hide();
                    }
                }
            });
        };

        $scope.deleteCategory = function() {
            $mdDialog.hide();
            Rest.deleteThing('/api/forum/', $scope.editingCategory._id)
                .then(function() {
                    getCategories();
                })
        };
}]);

// dtp.controller('forumShowCtrl', ['$scope', 'Title', '$routeParams', 'User', 'Forum', '$location',
//     function($scope, Title, $routeParams, User, Forum, $location) {
//
//         var id = $routeParams.postId;
//         $scope.Title = Title.setTitle('DTP - Forum');
//
//         if(User.currentUser !== '') {
//             $scope.user = User.currentUser;
//         }
//
//         $scope.getPost = function() {
//             Forum.getPost(id)
//                 .then(function(post) {
//                     $scope.post = post;
//                     $scope.postTitle = post.title;
//                     $scope.postContent = post.content;
//                     $scope.Title = Title.setTitle(post.title);
//                 });
//         };
//         $scope.getPost();
//
//         $scope.openModal = function() {
//             $('#content').trigger('autoresize');
//         };
//
//         $scope.updatePost = function() {
//             var updatedPost = {
//                 title: $scope.postTitle,
//                 content: $scope.postContent,
//                 editedBy: $scope.user
//             };
//             Forum.updatePost(id, updatedPost)
//                 .then(function() {
//                     $scope.getPost();
//                 })
//         };
//
//         $scope.deletePost = function() {
//             Forum.deletePost(id)
//                 .then(function() {
//                     $location.path('/forum');
//                 })
//         };
//
//         $(document).ready(function(){
//             $('.modal-trigger').leanModal();
//             $('.tooltipped').tooltip();
//         });
// }]);