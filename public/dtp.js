var dtp = angular.module('dtp', ['ngRoute', 'ngMaterial', 'angularMoment', 'ngSanitize']);

dtp.config(function ($routeProvider, $locationProvider, $mdThemingProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            templateUrl: 'home.html',
            controller: 'homeCtrl'
        })

        //User Routes
        .when('/user/:userId', {
            templateUrl: 'user/userShow.html',
            controller: 'userShowCtrl'
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
    $mdThemingProvider.theme('DTPDark')
        .primaryPalette('red')
        .accentPalette('grey')
        .warnPalette('red')
        .dark();

    $mdThemingProvider.setDefaultTheme('DTPDark');

        // Toast themes
    $mdThemingProvider.theme('success-toast');

    $mdThemingProvider.theme('error-toast');
});

// Filter to display links as links as well as sanitized html
dtp.filter('htmlLinky', function($sanitize, linkyFilter) {
    var ELEMENT_NODE = 1;
    var TEXT_NODE = 3;
    var linkifiedDOM = document.createElement('div');
    var inputDOM = document.createElement('div');

    var linkify = function linkify(startNode) {
        var i, ii, currentNode;

        for (i = 0, ii = startNode.childNodes.length; i < ii; i++) {
            currentNode = startNode.childNodes[i];

            switch (currentNode.nodeType) {
                case ELEMENT_NODE:
                    linkify(currentNode);
                    break;
                case TEXT_NODE:
                    linkifiedDOM.innerHTML = linkyFilter(currentNode.textContent);
                    i += linkifiedDOM.childNodes.length - 1;
                    while(linkifiedDOM.childNodes.length) {
                        startNode.insertBefore(linkifiedDOM.childNodes[0], currentNode);
                    }
                    startNode.removeChild(currentNode);
            }
        }

        return startNode;
    };

    return function(input) {
        inputDOM.innerHTML = input;
        return linkify(inputDOM).innerHTML;
    };
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
    this.generic = function(message) {
        var generic = $mdToast.simple(message)
            .position('top right');
        $mdToast.show(generic);
    };
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
                if(res.data.error) {
                    Notify.error(res.data.error);
                } else {
                    Notify.error('Failed to retrieve your user information');
                }
            })
    };
    this.updateOnlineStatus = function(id, status) {
        return $http.post('/api/status', {id: id, onlineStatus: status})
            .then(function(res) {
                return res.data;
            }, function(res) {
                if(res.data.error) {
                    Notify.error(res.data.error);
                } else {
                    Notify.error('Something went wrong while processing your request');
                }
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

dtp.directive('formattingHelp', function() {
    return {
        templateUrl: '../directives/formattingHelp.html',
        scope: {},
        replace: true,
        transclude: true
    }
});

// Runs anytime any page loads up for the first time.
// Ex. refresh or from external link. Not Angular routing
// Used for the nav and anything on all pages
dtp.controller('mainCtrl', ['$scope', 'Title', '$timeout', '$interval', '$document', '$window', '$http', '$location', 'User', 'Rest', '$mdSidenav', '$mdMedia',
function($scope, Title, $timeout, $interval, $document, $window, $http, $location, User, Rest, $mdSidenav, $mdMedia) {
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

    var noUpdateStatus = false; // Tells everything else not to change the status if it was forcibly set by the user

    $scope.setUserStatus = function(status) {
        User.updateOnlineStatus($scope.user._id, status);
        $scope.user.onlineStatus = 'Away';
        noUpdateStatus = true;
    };

    $scope.getOnlineUsers = function() {
        $scope.gotOnlineUsers = false; // Used to show loading circle until function completes
        Rest.getThings('/api/loggedInUsers')
            .then(function(users) {
                $scope.gotOnlineUsers = true;
                $scope.onlineUsers = users;
            })
    };
    $scope.getOnlineUsers();

    $interval(function() { // Update online user list every 5 minutes
        $scope.getOnlineUsers();
    }, 300000);

    // Side navs
    $scope.lockLeft = true;
    $scope.lockOnlineUsers = false;

    $scope.toggleLeft = function() {
        $mdSidenav('left').toggle();
    };

    $scope.toggleOnlineUsers = function() {
        $mdSidenav('onlineUsers').toggle();
        if($mdSidenav('onlineUsers').isOpen()) {
            $scope.getOnlineUsers();
        }
    };

    $scope.toggleLockOnlineUsers = function() {
        $scope.lockOnlineUsers = !$scope.lockOnlineUsers;
        if($scope.lockOnlineUsers) {
            $scope.getOnlineUsers();
        }
    };

    $scope.toggleLeftAndOnlineUsers = function() {
        $scope.toggleLeft();
        $scope.toggleOnlineUsers();
    };

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
        //     $scope.getOnlineUsers();
        // }

        function resetTimers() {
            /// Stop the pending timers
            // $timeout.cancel(logoutTimer);
            // $timeout.cancel(warningTimer);
            $timeout.cancel(awayStatusTimeout);

            if($scope.user.onlineStatus === 'Away' && !noUpdateStatus) {
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

dtp.controller('userShowCtrl', ['$scope', 'Title', 'User', 'Rest', '$routeParams', '$filter', function($scope, Title, User, Rest, $routeParams, $filter) {
    
    var userId = $routeParams.userId;

    if(User.currentUser !== '') {
        $scope.user = User.currentUser;
    }

    $scope.getUserProfile = function() {
        Rest.getThing('/api/user/' + userId)
            .then(function(user) {
                $scope.userProfile = user;
                Title.setTitle(user.name + '\'s Profile');
                Title.setPageTitle(user.name + '\'s Profile');

                $scope.bio = {
                    bio: $scope.userProfile.bio
                };

                $scope.about = {
                    name: $scope.userProfile.realName,
                    age: $scope.userProfile.age,
                    birthday: $scope.userProfile.birthday,
                    locations: $scope.userProfile.location,
                    occupation: $scope.userProfile.occupation
                };
            })
    };

    $scope.getUserProfile();

    $scope.editingAbout = false;

    $scope.editingAboutToggle = function() { $scope.editingAbout = !$scope.editingAbout; };

    $scope.editingBio = false;
    
    $scope.editingBioToggle = function() { $scope.editingBio = !$scope.editingBio; };

    $scope.saveProfile = function(userData) {
        Rest.updateThing('/api/user/' + userId, userData)
            .then(function() {
                if(userData === $scope.bio) {
                    $scope.editingBio = false;
                } else {
                    $scope.editingAbout = false;
                }
                $scope.getUserProfile();
            })
    };

    // Function to calculate age based on birthday
    // function getAge(dateString) {
    //     var today = new Date();
    //     var birthDate = new Date(dateString);
    //     var age = today.getFullYear() - birthDate.getFullYear();
    //     var m = today.getMonth() - birthDate.getMonth();
    //     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    //         age--;
    //     }
    //     return age;
    // }
}]);

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

    function getCategoryPosts() {
        $scope.gotCategoryPosts = false;
        Rest.getThings('/api/forum/allCategories')
            .then(function(categoryPosts) {
                if(categoryPosts) {
                    $scope.categoryPosts = categoryPosts;
                    $scope.gotCategoryPosts = true;
                }
            })
    }
    getCategoryPosts();

    function getRecentPosts() {
        Rest.getThings('/api/forum/recentPosts')
            .then(function(res) {
                $scope.recentPosts = res;
            })
    }
    getRecentPosts();

    $scope.$location = $location;

    $scope.newPost = {
        category: '',
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
                        Notify.generic('You must be logged in to create a post');
                        $mdDialog.hide();
                    } else if(!$scope.newPost.category) {
                        Notify.generic('Select a category for your post to go in')
                    } else if(!$scope.newPost.title) {
                        Notify.generic('Your post needs a title!');
                    } else if(!$scope.newPost.content) {
                        Notify.generic('Your post needs some content');
                    } else {
                        $mdDialog.hide();
                        var catPath = $scope.newPost.category.path;
                        var newPost = {
                            title: $scope.newPost.title,
                            content: $scope.newPost.content,
                            authour: $scope.user
                        };
                        Rest.newThing('/api' + catPath, newPost)
                            .then(function(res) {
                                $scope.newPost = {
                                    category: '',
                                    title: '',
                                    content: ''
                                };
                                $location.path(catPath + '/' + res._id)
                            });
                    }
                };
            }
        });
    };
    
    $scope.showFormattingHelp = false;
    
    $scope.toggleFormattingHelp = function() {
        $scope.showFormattingHelp = !$scope.showFormattingHelp;
    };

    $scope.newCategory = '';

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
                        Notify.generic('You must be logged in to create a category');
                        $mdDialog.hide();
                    } else if($scope.newCategory === '') {
                        Notify.generic('A category needs a title!');
                    } else {
                        $mdDialog.hide();
                        var catPath = '/forum/' + $scope.newCategory.toLowerCase();
                        var newCategory = {
                            title: $scope.newCategory,
                            path: catPath,
                            createdBy: $scope.user
                        };
                        Rest.newThing('/api/forum', newCategory)
                            .then(function() {
                                $scope.newCategory = '';
                                getCategories();
                                getRecentPosts();
                                getCategoryPosts();
                            });
                    }
                };
            }
        });
    };
    
    $scope.editingCategory = '';

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
                        Notify.generic('You must be logged in to edit a category');
                        $mdDialog.hide();
                    } else if($scope.editingCategory === '') {
                        Notify.generic('A category needs a title!');
                    } else {
                        $mdDialog.hide();
                        var updatedCategory = {
                            title: $scope.editingCategory.title,
                            editedBy: $scope.user
                        };
                        Rest.updateThing('/api/forum/' + $scope.editingCategory._id, updatedCategory)
                            .then(function() {
                                $scope.editingCategory = '';
                                getCategories();
                                getRecentPosts();
                                getCategoryPosts();
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
                    Notify.generic('You must be logged in to delete a category');
                    $mdDialog.hide();
                } else {
                    $scope.deleteCategory = function() {
                        $mdDialog.hide();
                        Rest.deleteThing('/api/forum/' + $scope.editingCategory._id)
                            .then(function() {
                                $scope.editingCategory = '';
                                getCategories();
                                getRecentPosts();
                                getCategoryPosts();
                            })
                    };
                }
            }
        });
    };
}]);

dtp.controller('forumPostIndexCtrl', ['$scope', 'Title', 'User', 'Rest', 'Notify', '$mdDialog', '$routeParams', '$location', '$http',
function($scope, Title, User, Rest, Notify, $mdDialog, $routeParams, $location, $http) {

    var categoryPath = $routeParams.categoryPath;

    if(User.currentUser !== '') {
        $scope.user = User.currentUser;
    }

    function getCategory() {
        Rest.getThing('/api/forum/singleCategory/' + categoryPath)
            .then(function(res) {
                $scope.category = res;
                $scope.postLabels = [1];

                Title.setTitle($scope.category.title);
                Title.setPageTitle($scope.category.title);

                var count = 0;
                var postsPerPage = 20;
                $scope.category.posts.forEach(function() {
                    count++;
                    if(count > postsPerPage) {
                        var nextPage = $scope.postLabels.length + 1;
                        $scope.postLabels.push(nextPage);
                        postsPerPage += 20;
                    }
                });
            })
    }
    getCategory();

    $scope.gotPosts = false;
    
    $scope.getPosts = function(label) {
        $scope.gotPosts = false;
        var skip = (label - 1) * 20;
        $http.get('/api/forum/' + categoryPath, {params: {skip: skip}})
            .then(function(res) {
                $scope.posts = res.data.posts;
                $scope.gotPosts = true;
            }, function(res) {
                if(res.data.error) {
                    Notify.error(res.data.error);
                } else {
                    Notify.error('Failed to retrieve posts');
                }
            });
    };
    $scope.getPosts(1);

    function getRecentPosts() {
        Rest.getThings('/api/forum/recentPosts')
            .then(function(res) {
                $scope.recentPosts = res;
            })
    }
    getRecentPosts();

    function getCategories() {
        $scope.gotCategories = false;
        Rest.getThings('/api/forum/allCategories')
            .then(function(categories) {
                if(categories) {
                    $scope.categories = categories;
                    $scope.gotCategories = true;
                }
            })
    }
    getCategories();
    
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
                        Notify.generic('You must be logged in to create a post');
                        $mdDialog.hide();
                    } else if(!$scope.newPost.title) {
                        Notify.generic('Your post needs a title!');
                    } else if(!$scope.newPost.content) {
                        Notify.generic('Your post needs some content');
                    } else {
                        $mdDialog.hide();
                        var newPost = {
                            title: $scope.newPost.title,
                            content: $scope.newPost.content,
                            authour: $scope.user
                        };
                        Rest.newThing('/api/forum/' + categoryPath, newPost)
                            .then(function(post) {
                                $scope.newPost = {
                                    title: '',
                                    content: ''
                                };
                                $location.path($scope.category.path + '/' + post._id)
                            });
                    }
                };
            }
        });
    };

    $scope.showFormattingHelp = false;

    $scope.toggleFormattingHelp = function() {
        $scope.showFormattingHelp = !$scope.showFormattingHelp;
    };

    $scope.$location = $location;
}]);

dtp.controller('forumPostShowCtrl', ['$scope', 'Title', 'User', 'Rest', 'Notify', '$mdDialog', '$routeParams', '$location', '$http',
function($scope, Title, User, Rest, Notify, $mdDialog, $routeParams, $location, $http) {

    var categoryPath = $routeParams.categoryPath;
    var postId = $routeParams.postId;

    if(User.currentUser !== '') {
        $scope.user = User.currentUser;
    }

    function getPost() {
        Rest.getThing('/api/forum/' + categoryPath + '/' + postId)
            .then(function(res) {
                $scope.post = res;
                $scope.commentLabels = [1];

                Title.setTitle($scope.post.title);
                Title.setPageTitle($scope.post.title);

                var count = 0;
                var commentsPerPage = 20;
                $scope.post.comments.forEach(function() {
                    count++;
                    if (count > commentsPerPage) {
                        var nextPage = $scope.commentLabels.length + 1;
                        $scope.commentLabels.push(nextPage);
                        commentsPerPage += 20;
                    }
                });
                $scope.getComments(1);
            })
    }
    getPost();

    $scope.gotComments = false;

    $scope.getComments = function(label) {
        $scope.gotComments = false;
        var skip = (label - 1) * 20;
        $http.get('/api/forum/' + categoryPath + '/' + $scope.post._id + '/comments', {params: {skip: skip}})
            .then(function(res) {
                $scope.comments = res.data.comments;
                $scope.gotComments = true;
            }, function(res) {
                if(res.data.error) {
                    Notify.error(res.data.error);
                } else {
                    Notify.error('Failed to retrieve comments');
                }
            });
    };

    function getCategories() {
        $scope.gotCategories = false;
        Rest.getThings('/api/forum/allCategories')
            .then(function(categories) {
                if(categories) {
                    $scope.categories = categories;
                    $scope.gotCategories = true;
                }
            })
    }
    getCategories();

    function getRecentPosts() {
        Rest.getThings('/api/forum/recentPosts')
            .then(function(res) {
                $scope.recentPosts = res;
            })
    }
    getRecentPosts();

    $scope.$location = $location;

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
                        Notify.generic('You must be logged in to edit a post');
                        $mdDialog.hide();
                    } else if($scope.post.title === '') {
                        Notify.generic('A post needs a title!');
                    } else if($scope.post.content === '') {
                        Notify.generic('A post needs content!');
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
                        Notify.generic('You must be logged in to delete a post');
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
    
    $scope.lockPost = function(val) {
        Rest.updateThing('/api/forum/' + categoryPath + '/' + $scope.post._id, {locked: val})
            .then(function() {
                getPost();
                getCategories();
                getRecentPosts();
            })
    };

    $scope.movingPost = {
        category: '',
        editedBy: $scope.user
    };

    $scope.movePostDialog = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true,
            contentElement: '#movePost',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                $scope.movePost = function() {
                    if(!$scope.user) {
                        Notify.generic('You must be logged in to move a post');
                        $mdDialog.hide();
                    } else{
                        $mdDialog.hide();
                        Rest.updateThing('/api/forum/' + categoryPath + '/' + $scope.post._id + '/move', $scope.movingPost)
                            .then(function(res) {
                                $location.path($scope.movingPost.category.path + '/' + $scope.post._id);
                                $scope.movingPost = {
                                    category: '',
                                    editedBy: $scope.user
                                };
                            })
                    }
                };
            }
        });
    };

    $scope.newComment = {
        comment: '',
        authour: $scope.user
    };

    $scope.createComment = function() {
        if(!$scope.user) {
            Notify.generic('You must be logged in to create a comment');
        } else if(!$scope.newComment.comment) {
            Notify.generic('Your comment needs to say something!');
        } else {
            Rest.newThing('/api/forum/' + categoryPath + '/' + $scope.post._id, $scope.newComment)
                .then(function() {
                    $scope.newComment.comment = '';
                    getPost();
                    getRecentPosts();
                });
        }
    };
    
    $scope.editingComment = false;
    
    $scope.updateComment = function(comment) {
        if(!$scope.user) {
            Notify.generic('You must be logged in to update a comment');
        } else if(!comment.comment) {
            Notify.generic('Your comment needs to say something!');
        } else {
            var updatedComment = {
                comment: comment.comment,
                editedBy: $scope.user
            };
            Rest.updateThing('/api/forum/' + categoryPath + '/' + $scope.post._id + '/' + comment._id, updatedComment)
                .then(function() {
                    getPost();
                    getRecentPosts();
                })
        }
    };
    
    $scope.confirmDeleteComment = function(commentId) {
        $mdDialog.show({
            scope: $scope,
            preserveScope: true,
            contentElement: '#deleteComment',
            controller: function DialogController($scope, $mdDialog) {
                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                $scope.deleteComment = function() {
                    if(!$scope.user) {
                        Notify.generic('You must be logged in to delete a comment');
                        $mdDialog.hide();
                    } else{
                        $mdDialog.hide();
                        Rest.deleteThing('/api/forum/' + categoryPath + '/' + $scope.post._id + '/' + commentId)
                            .then(function() {
                                getPost();
                                getRecentPosts();
                            })
                    }
                };
            }
        });
    };
}]);