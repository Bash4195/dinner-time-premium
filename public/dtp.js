var dtp = angular.module('dtp', ['ngRoute', 'ngMaterial', 'ngMessages', 'angularMoment', 'ngSanitize']);

dtp.config(function ($compileProvider, $routeProvider, $locationProvider, $mdThemingProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|steam):/);
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            templateUrl: 'home.html',
            controller: 'homeCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })

        // Admin routes
        .when('/admin', {
            templateUrl: 'admin/dashboard.html',
            controller: 'adminDashboardCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })
        .when('/admin/applications', {
            templateUrl: 'admin/applications/applicationsIndex.html',
            controller: 'adminApplicationsIndexCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })
        .when('/admin/application/:appId', {
            templateUrl: 'admin/applications/applicationShow.html',
            controller: 'adminApplicationsShowCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })

        //User Routes
        .when('/users', {
            templateUrl: 'user/userIndex.html',
            controller: 'userIndexCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })
        .when('/user/:userId', {
            templateUrl: 'user/userShow.html',
            controller: 'userShowCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })

        // Mod Application Routes
        .when('/apply', {
            templateUrl: 'apply/moderatorApplicationRequirements.html',
            controller: 'moderatorApplicationRequirementsCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })
        .when('/apply/:userId', {
            templateUrl: 'apply/moderatorApplicationCreate.html',
            controller: 'moderatorApplicationCreateCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })
        .when('/application/:appId', {
            templateUrl: 'applications/moderatorApplicationShow.html',
            controller: 'moderatorApplicationShowCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })

        // News Routes
        .when('/news', {
            templateUrl: 'news/newsIndex.html',
            controller: 'newsIndexCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })
        .when('/news/:newsId', {
            templateUrl: 'news/newsShow.html',
            controller: 'newsShowCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })

        // Forum Routes
        .when('/forum', {
            templateUrl: 'forum/category/forumCategoryIndex.html',
            controller: 'forumCategoryIndexCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })
        .when('/forum/:categoryPath', {
            templateUrl: 'forum/post/forumPostIndex.html',
            controller: 'forumPostIndexCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })
        .when('/forum/:categoryPath/:postId', {
            templateUrl: 'forum/post/forumPostShow.html',
            controller: 'forumPostShowCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })

        // Rules
        .when('/rules', {
            templateUrl: 'rules/rules.html',
            controller: 'rulesCtrl',
            resolve: {
                user: function(User) {
                    User.getCurrentUser();
                }
            }
        })

        .otherwise({
            templateUrl: '404.html'
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

// Factory just in case this is needed in multiple places of the application
dtp.factory('Ranks', function() {
    return [
        'GOD',
        'GODDESS',
        'Seraph',
        'Lord',
        'Admin',
        'Moderator',
        'Aristocrat',
        'VIP',
        'Donator',
        'User'
    ];
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

    this.currentUser = null;

    this.getUser = function() {
        return self.currentUser;
    };

    this.getCurrentUser = function() {
        return $http.get('/auth/getCurrentUser')
        .success(function(user) {
            self.currentUser = user;
            return self.currentUser;
        })
        .error(function(res) {
            self.currentUser = null;
            if(res) {
                if(res.data.error) {
                    Notify.error(res.data.error);
                } else {
                    Notify.error('Failed to retrieve your user information');
                }
            } else {
                Notify.error('Something went wrong, please login again');
            }
        })
    }
}]);

dtp.service('Rest', ['$http', 'Notify', function($http, Notify) {
    // INDEX + SHOW
    this.get = function(path, params) {
        return $http.get(path, {params: params})
            .then(function(res) {
                return res.data;
            }, function(res) {
                // Check this as it won't exist if the server is offline
                if(res.data) {
                    if(res.data.error) {
                        Notify.error(res.data.error);
                    } else {
                        Notify.error('Something went wrong while processing your request');
                    }
                } else {
                    Notify.error('Something went wrong while processing your request');
                }
            })
    };
    // CREATE
    this.post = function(path, newThing, params) {
        return $http.post(path, newThing, {params: params})
            .then(function(res) {
                return res.data;
            }, function(res) {
                // Check this as it won't exist if the server is offline
                if(res.data) {
                    if(res.data.error) {
                        Notify.error(res.data.error);
                    } else {
                        Notify.error('Something went wrong while processing your request');
                    }
                } else {
                    Notify.error('Something went wrong while processing your request');
                }
            })
    };
    // UPDATE
    this.put = function(path, updatedThing, params) {
        return $http.put(path, updatedThing, {params: params})
            .then(function(res) {
                return res.data;
            }, function(res) {
                // Check this as it won't exist if the server is offline
                if(res.data) {
                    if(res.data.error) {
                        Notify.error(res.data.error);
                    } else {
                        Notify.error('Something went wrong while processing your request');
                    }
                } else {
                    Notify.error('Something went wrong while processing your request');
                }
            })
    };
    // DELETE
    this.delete = function(path, params) {
        return $http.delete(path, {params: params})
            .then(function(res) {
                return res.data;
            }, function(res) {
                // Check this as it won't exist if the server is offline
                if(res.data) {
                    if(res.data.error) {
                        Notify.error(res.data.error);
                    } else {
                        Notify.error('Something went wrong while processing your request');
                    }
                } else {
                    Notify.error('Something went wrong while processing your request');
                }
            })
    };
}]);

dtp.directive('pageNotFound', function() {
    return {
        templateUrl: '../directives/pageNotFound.html',
        scope: {},
        replace: true,
        transclude: true
    }
});

dtp.directive('formattingHelp', function() {
    return {
        templateUrl: '../directives/formattingHelp.html',
        scope: {},
        replace: true,
        transclude: true
    }
});

dtp.directive('loginPrompt', function() {
    return {
        templateUrl: '../directives/loginPrompt.html',
        scope: {
            user: '='
        },
        replace: true,
        transclude: true
    }
});

dtp.directive('unauthorized', function() {
    return {
        templateUrl: '../directives/unauthorized.html',
        scope: {
            user: '=',
            authorized: '='
        },
        replace: true,
        transclude: true
    }
});

// Runs anytime any page loads up for the first time.
// Ex. refresh or from external link. Not Angular routing
// Used for the nav and anything on all pages
dtp.controller('mainCtrl', ['$scope', 'Title', '$timeout', '$interval', '$document', '$window', '$http', '$location', 'User', 'Rest', 'Notify', '$mdSidenav', '$mdMedia',
function($scope, Title, $timeout, $interval, $document, $window, $http, $location, User, Rest, Notify, $mdSidenav, $mdMedia) {
    $scope.Title = Title;

    $scope.$mdMedia = $mdMedia; // For opening menus from html

    $scope.gotOnlineUsers = false;

    // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
    $scope.$watch(User.getUser, function() {
        $scope.user = User.getUser();
    }, true);

    User.getCurrentUser()
        .then(function(user) {
            if(user.data) { // Check for user first because it could be empty! No one HAS to login

                $scope.user = User.getUser(); // Set to a reference to the object
                // If we set it to User.current user, it will just COPY the current properties

                onInactive();// When user logs in start checking for inactivity

                if($scope.user.onlineStatus !== 'Online') {
                    Rest.put('/api/user/' + $scope.user._id, {onlineStatus: 'Online'})
                        .then(function() {
                            User.currentUser.onlineStatus = 'Online';
                        })
                }

                // On refresh or browser close, set user status to away
                angular.element($window).bind("beforeunload", function() {
                    Rest.put('/api/user/' + $scope.user._id, {onlineStatus: 'Away'})
                });
            }
        });

    // Update user every 5 minutes
    $interval(function() {
        User.getCurrentUser();
    }, 300000);

    var noUpdateStatus = false; // Tells everything else not to change the status if it was forcibly set by the user

    // For MANUALLY setting status only!
    $scope.setUserStatus = function(status, noUpdate) {
        if(User.currentUser && status != User.currentUser.onlineStatus || User.currentUser && noUpdate) {
            Rest.put('/api/user/' + $scope.user._id, {onlineStatus: status})
                .then(function() {
                    User.getCurrentUser();
                });
            if(noUpdate) {
                noUpdateStatus = true;
            }
        } else if(!User.currentUser) {
            Notify.error('Something went wrong, please login again.');
        }
    };

    $scope.getOnlineUsers = function() {
        $scope.gotOnlineUsers = false; // Used to show loading circle until function completes
        Rest.get('/api/loggedInUsers')
            .then(function(users) {
                // Remove current user from this list as we are not interested in seeing that
                for(let i = users.length - 1; i >= 0; i--) {
                    if(users[i]._id == $scope.user._id) {
                        users.splice(i, 1);
                        break;
                    }
                }
                $scope.gotOnlineUsers = true;
                $scope.onlineUsers = users;
            })
    };

    $interval(function() { // Update online user list every 5 minutes if it's open
        if($scope.lockOnlineUsers || $mdSidenav('onlineUsers').isOpen()) {
            $scope.getOnlineUsers();
        }
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

    // $scope.newNotifications = false;
    //
    // $scope.getNotifications = function() {
    //
    // };

    // Set user status to away after 10 minutes
    // This function can also log users out after 30 minutes.
    // In case we want to add it back in the future
    function onInactive() {
        // Timeout timer value in milliseconds
        // var timeout = 1800000;
        // var warningTimeout = 1200000;
        var awayStatusTimeout = 600000; // 10 mins
        // var timeBetween = timeout - warningTimeout;
        // var loggedOut = false;

        // Start a timeout
        // var logoutTimer = $timeout(function(){ logoutUser() }, timeout);
        // var warningTimer = $timeout(function() { warnUser() }, warningTimeout);
        var awayStatusTimer = $timeout(function() { $scope.setUserStatus('Away', false); }, awayStatusTimeout);

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
            }, {passive: true});

        // function warnUser() {
        //     $mdDialog.show({
        //         clickOutsideToClose: true,
        //         fullscreen: true,
        //         contentElement: '#logoutWarning'
        //     });
        // }

        // $scope.timeLeft = timeBetween + 1000; // Extra second because tick runs immediately
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
            // Stop the pending timers
            // $timeout.cancel(logoutTimer);
            // $timeout.cancel(warningTimer);
            $timeout.cancel(awayStatusTimeout);

            if(User.currentUser) {
                if (User.currentUser.onlineStatus === 'Away' && !noUpdateStatus) {
                    $scope.setUserStatus('Online', false);
                }

                // After 5 minutes, start this again
                $timeout(function () {
                    // Reset the timers
                    // logoutTimer = $timeout(function(){ logoutUser() }, timeout);
                    // warningTimer = $timeout(function() { warnUser() }, warningTimeout);
                    awayStatusTimer = $timeout(function () {
                        $scope.setUserStatus('Away', false);
                    }, awayStatusTimeout);
                }, 300000);
            }
        }
    }
}]);

dtp.controller('adminDashboardCtrl', ['$scope', 'Title', 'User', function($scope, Title, User) {
    // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
    $scope.$watch(User.getUser, function() {
        $scope.user = User.getUser();
    }, true);

    Title.setTitle('DTP');
    Title.setPageTitle('Dinner Time Premium');

    $scope.authorized = false;
    if($scope.user && $scope.user.roles.includes('Staff')) {
        $scope.authorized = true;
        Title.setTitle('Admin Dashboard - DTP');
        Title.setPageTitle('Admin Dashboard');

    } else {
        $scope.authorized = false;
    }
}]);

dtp.controller('adminApplicationsIndexCtrl', ['$scope', 'Title', 'User', 'Rest', '$location', function($scope, Title, User, Rest, $location) {
    // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
    $scope.$watch(User.getUser, function() {
        $scope.user = User.getUser();
    }, true);

    Title.setTitle('DTP');
    Title.setPageTitle('Dinner Time Premium');

    $scope.authorized = false;
    if($scope.user && $scope.user.roles.includes('Staff')) {
        $scope.authorized = true;
        Title.setTitle('Moderator Applications - DTP');
        Title.setPageTitle('Moderator Applications');

        var skip = 0;
        $scope.getModApps = function() {
            $scope.gotApps = false;
        
            Rest.get('/api/admin/applications', {skip: skip})
                .then(function(apps) {
                    if($scope.apps) {
                        $scope.apps = $scope.apps.concat(apps.apps);
                    } else {
                        $scope.apps = apps.apps;
                    }
                    $scope.numApps = apps.count;
                    $scope.gotApps = true;
                    skip += 20;
                });
        };
        $scope.getModApps();

        $scope.$location = $location;
    } else {
        $scope.authorized = false;
    }
}]);

dtp.controller('adminApplicationsShowCtrl', ['$scope', '$routeParams', 'Title', 'User', 'Rest', 'Notify', '$mdDialog',
    function($scope, $routeParams, Title, User, Rest, Notify, $mdDialog) {
        var appId = $routeParams.appId;

        // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
        $scope.$watch(User.getUser, function() {
            $scope.user = User.getUser();
        }, true);

        Title.setTitle('DTP');
        Title.setPageTitle('Dinner Time Premium');

        $scope.authorized = false;
        if($scope.user && $scope.user.roles.includes('Staff')) {
            $scope.authorized = true;
            Title.setTitle('Moderator Application - DTP');
            Title.setPageTitle('Moderator Application');

            $scope.hasVoted = false;

            function getModApp() {
                $scope.gotApp = false;

                Rest.get('/api/admin/application/' + appId)
                    .then(function(app) {
                        $scope.app = app;
                        $scope.gotApp = true;

                        if(app.status === 'Under Review') {
                            $scope.appStatus = 33;
                        } else if(app.status === 'Awaiting Votes') {
                            $scope.appStatus = 66;
                        } else if(app.status === 'Accepted' || app.status === 'Rejected') {
                            $scope.appStatus = 100;
                        } else {
                            $scope.appStatus = 0;
                        }

                        if($scope.app.votes.length >= 1) {
                            for(let i = 0; i <= $scope.app.votes.length; i++) {
                                if($scope.app.votes[i].voter._id != $scope.user._id) {
                                    $scope.hasVoted = false;
                                } else {
                                    $scope.hasVoted = true;
                                    break;
                                }
                            }
                        }

                        Title.setTitle(app.authour.name + '\'s Moderator Application - DTP');
                        Title.setPageTitle(app.authour.name + '\'s Moderator Application');

                        $scope.commentLabels = [];
                        var tabs = $scope.app.comments.length / 20;

                        for(var i = 0; i < tabs; i++) {
                            $scope.commentLabels.push(i + 1);
                        }
                        getComments($scope.label);
                    });
            }
            getModApp();

            $scope.openApplication = function() {
                Rest.put('/api/admin/application/' + $scope.app._id, {closed: false})
                    .then(function() {
                        getModApp();
                    });
            };

            $scope.closeApplication = function() {
                Rest.put('/api/admin/application/' + $scope.app._id, {closed: true})
                    .then(function() {
                        getModApp();
                    });
            };

            // For the "No" answer to "Willing to add us on Steam"
            $scope.rejectApplication = function() {
                Rest.put('/api/admin/application/' + $scope.app._id, {status: 'Rejected', closed: true})
                    .then(function() {
                        getModApp();
                    });
            };

            $scope.appReview = {
                warnings: null,
                vacBans: null,
                hours: null
            };

            $scope.submitReview = function(status) {
                if(!$scope.user) {
                    Notify.generic('You must be logged in to do that');
                } else if($scope.appReview.warnings === null || $scope.appReview.vacBans === null || $scope.appReview.hours === null) {
                    Notify.generic('You need to fill out all fields in the review!');
                } else {
                    var reviewedApp = {
                        status: 'Rejected',
                        closed: true,
                        review: {
                            warnings: $scope.appReview.warnings,
                            vacBans: $scope.appReview.vacBans,
                            hours: $scope.appReview.hours,
                            accepted: false,
                            reviewedBy: $scope.user
                        }
                    };

                    if(status === 'Accepted') {
                        reviewedApp.status = 'Awaiting Votes';
                        reviewedApp.closed = false;
                        reviewedApp.review.accepted = true;
                    }

                    Rest.put('/api/admin/application/' + $scope.app._id, reviewedApp)
                        .then(function() {
                            $scope.editingReview = false;
                            getModApp();
                        })
                }
            };
            
            $scope.editingReview = false;
            
            $scope.toggleEditingReview = function() {
                $scope.editingReview = !$scope.editingReview;

                $scope.appReview = {
                    warnings: $scope.app.review.warnings,
                    vacBans: $scope.app.review.vacBans,
                    hours: $scope.app.review.hours
                };
            };
            
            $scope.submitVote = function(vote) {
                if(!$scope.user) {
                    Notify.generic('You must be logged in to do that');
                } else if(vote === null) {
                    Notify.generic('Something went wrong while voting, please refresh the page');
                } else {
                    var appVote = {
                        vote: vote,
                        voter: $scope.user
                    };
                    
                    Rest.put('/api/admin/application/' + $scope.app._id + '/vote', appVote)
                        .then(function() {
                            $scope.editingVote = false;
                            getModApp();
                        })
                }
            };
            
            $scope.editingVote = false;
            
            $scope.toggleEditingVote = function() {
                $scope.editingVote = !$scope.editingVote;
            };
            
            $scope.gotComments = false;

            function getComments(label) {
                $scope.gotComments = false;

                var skip = (label - 1) * 20;

                Rest.get('/api/admin/application/' + $scope.app._id + '/comments', {skip: skip})
                    .then(function(appWithComments) {
                        $scope.comments = appWithComments.comments;
                        $scope.label = label;
                        $scope.gotComments = true;
                    })
            }

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
                    Rest.post('/api/admin/application/' + $scope.app._id, $scope.newComment)
                        .then(function() {
                            $scope.newComment.comment = '';
                            getModApp();
                        });
                }
            };

            $scope.editingComment = false;

            $scope.toggleEditingComment = function(id) {
                $scope.editingComment = !$scope.editingComment;
                $scope.editingCommentId = id;
            };

            $scope.updateComment = function(comment) {
                $scope.editingComment = false;
                if(!$scope.user) {
                    Notify.generic('You must be logged in to update a comment');
                } else if(!comment.comment) {
                    Notify.generic('Your comment needs to say something!');
                } else {
                    var updatedComment = {
                        comment: comment.comment,
                        editedBy: $scope.user,
                        editedAt: new Date()
                    };
                    Rest.put('/api/admin/application/' + $scope.app._id + '/' + comment._id, updatedComment)
                        .then(function() {
                            getModApp()
                        })
                }
            };

            var commentId = '';

            $scope.confirmDeleteComment = function(id) {
                commentId = id;
                $mdDialog.show({
                    contentElement: '#deleteComment'
                });
            };

            $scope.closeDialog = function() {
                $mdDialog.cancel();
            };

            $scope.deleteComment = function() {
                if(!$scope.user) {
                    Notify.generic('You must be logged in to delete a comment');
                    $mdDialog.hide();
                } else{
                    $mdDialog.hide();
                    Rest.delete('/api/admin/application/' + $scope.app._id + '/' + commentId)
                        .then(function() {
                            commentId = '';
                            getModApp();
                        })
                }
            };
        } else {
            $scope.authorized = false;
        }
}]);

dtp.controller('homeCtrl', ['$scope', 'Title', 'User', function($scope, Title, User) {
    Title.setTitle('DTP');
    Title.setPageTitle('Dinner Time Premium');
}]);

dtp.controller('userIndexCtrl', ['$scope', 'Title', 'Rest', '$location', function($scope, Title, Rest, $location) {
    Title.setTitle('Users - DTP');
    Title.setPageTitle('Users');

    $scope.search = '';

    $scope.gotUsers = false;

    // Used for pagination but angular material tabs cause so many $digests that the page freezes with enough tabs
    // $scope.retrieveUsers = function() {
    //     $scope.gotUsers = false;
    //
    //     Rest.get('/api/users/count', {search: $scope.search})
    //         .then(function(numUsers) {
    //             $scope.userLabels = [];
    //             var tabs = numUsers / 20;
    //
    //             for(var i = 0; i < tabs; i++) {
    //                 $scope.userLabels.push(i + 1);
    //             }
    //             $scope.getUsers(1);
    //         });
    // };

    function getUsers() {
        $scope.gotUsers = false;
        // var skip = (label - 1) * 20; // For pagination
        Rest.get('/api/users', {search: $scope.search})//, skip: skip}) // Pagination
            .then(function(users) {
                $scope.users = users;
                $scope.gotUsers = true;
            })
    }
    getUsers();

    $scope.submitSearch = function() {
        getUsers();
    };

    $scope.$location = $location;
}]);

dtp.controller('userShowCtrl', ['$scope', 'Title', 'User', 'Rest', 'Ranks', '$routeParams', 'Notify',
    function($scope, Title, User, Rest, Ranks, $routeParams, Notify) {
        // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
        $scope.$watch(User.getUser, function() {
            $scope.user = User.getUser();
        }, true);

        Title.setTitle('DTP');
        Title.setPageTitle('Dinner Time Premium');

        var userId = $routeParams.userId;

        $scope.gotUser = false;
        $scope.getUserProfile = function() {
            $scope.gotUser = false;
            Rest.get('/api/user/' + userId)
                .then(function(user) {
                    $scope.userProfile = user;
                    $scope.gotUser = true;
                    
                    Title.setTitle(user.name + '\'s Profile - DTP');
                    Title.setPageTitle(user.name + '\'s Profile');

                    $scope.bio = {
                        bio: $scope.userProfile.bio
                    };

                    $scope.about = {
                        realName: $scope.userProfile.realName,
                        gender: $scope.userProfile.gender,
                        age: $scope.userProfile.age,
                        setBday: 'false',
                        birthday: new Date($scope.userProfile.birthday),
                        location: $scope.userProfile.location,
                        occupation: $scope.userProfile.occupation
                    };

                    // Set the date to 18 years before today by default
                    if(!$scope.userProfile.birthday) {
                        var date = new Date();
                        date.setFullYear( date.getFullYear() - 18 );
                        $scope.about.birthday = date;
                    } else {
                        $scope.about.setBday = 'true';
                    }

                    $scope.permissions = {
                        rank: $scope.userProfile.rank,
                        roles: $scope.userProfile.roles,
                        permissions: $scope.userProfile.permissions
                    }
                })
        };
        $scope.getUserProfile();

        $scope.editingAbout = false;
        $scope.editingAboutToggle = function() { $scope.editingAbout = !$scope.editingAbout; };

        $scope.editingBio = false;
        $scope.editingBioToggle = function() { $scope.editingBio = !$scope.editingBio; };

        var canSubmit = false;
        $scope.saveProfile = function(userData) {
            if(userData === $scope.bio) {
                if(!$scope.user) {
                    Notify.generic('You must be logged in to do that');
                } else {
                    $scope.editingBio = false;
                    canSubmit = true;
                }
            } else if(userData === $scope.about) {
                if(!$scope.user) {
                    Notify.generic('You must be logged in to do that');
                } else {
                    if($scope.about.setBday === 'false') {
                        $scope.about.birthday = null;
                    }
                    $scope.editingAbout = false;
                    canSubmit = true;
                }
            }
            if(canSubmit) {
                Rest.put('/api/user/' + userId, userData)
                    .then(function() {
                        $scope.getUserProfile();
                        User.getCurrentUser(); // Using this instead of a returned user to keep the front end updated with the latest permissions
                    });
                canSubmit = false;
            }
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

        $scope.permissionsOpen = false;
        $scope.togglePermissions = function() { $scope.permissionsOpen = !$scope.permissionsOpen };

        $scope.ranks = Ranks;

        $scope.editingPermissions = false;
        $scope.editingPermissionsToggle = function() {
            if($scope.user.roles.includes('Super Admin')) {
                $scope.editingPermissions = !$scope.editingPermissions;
            }
        };

        $scope.savePermissions = function() {
            Rest.put('/api/user/' + userId + '/updatePermissions', $scope.permissions)
                .then(function() {
                    $scope.editingPermissions = false;
                    $scope.getUserProfile();
                    User.getCurrentUser();
                })
        };
}]);

dtp.controller('moderatorApplicationRequirementsCtrl', ['$scope', 'Title', 'User', 'Notify', '$location', function($scope, Title, User, Notify, $location) {
    // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
    $scope.$watch(User.getUser, function() {
        $scope.user = User.getUser();
    }, true);

    Title.setTitle('Moderator Application Requirements - DTP');
    Title.setPageTitle('Moderator Application Requirements');

    $scope.terms = {accepted: false};

    $scope.createApplication = function() {
        if($scope.terms.accepted) {
            $location.path('/apply/' + $scope.user._id)
        } else {
            Notify.generic('You must accept the terms first!');
        }
    }
}]);

dtp.controller('moderatorApplicationCreateCtrl', ['$scope', 'Title', 'User', 'Notify', 'Rest', '$mdDialog', '$location',
    function($scope, Title, User, Notify, Rest, $mdDialog, $location) {
        // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
        $scope.$watch(User.getUser, function() {
            $scope.user = User.getUser();
        }, true);

        if($scope.user) {
            Title.setTitle($scope.user.name + '\'s Moderator Application - DTP');
            Title.setPageTitle($scope.user.name + '\'s Moderator Application');
        } else {
            Title.setTitle('DTP');
            Title.setPageTitle('Dinner Time Premium');
        }

        $scope.application = {
            name: '',
            gender: '',
            age: '',
            location: '',
            occupation: '',
            timePlayedGmod: '',
            howYouFoundUs: '',
            ulxExperience: '',
            leadershipExperience: '',
            gmodLeadershipExperience: '',
            willingToAddUsOnSteam: false,
            whyWeShouldAccept: '',
            additionalInfo: '',

            authour: $scope.user
        };

        $scope.closeDialog = function() {
            $mdDialog.cancel();
        };

        $scope.submitApplication = function() {
            // Submit without checking as it should be done before the dialog was opened
            Rest.post('/api/apply/' + $scope.user._id, $scope.application)
                .then(function() {
                    $location.path('/application/' + $scope.user._id);
                })
        };

        $scope.confirmSubmission = function() {
            // Do checking here so we don't unnecessarily show the dialog
            if(!$scope.user) {
                Notify.generic('You must be logged in to do that');
            } else if(!$scope.user.permissions.general.canApplyToMod) {
                Notify.generic('You don\'t have permission to make an application');
            } else if(!$scope.application.ulxExperience) {
                Notify.generic('You need to answer the "ULX Experience" field');
            } else if(!$scope.application.leadershipExperience) {
                Notify.generic('You need to answer the "Leadership Experience" field');
            } else if(!$scope.application.gmodLeadershipExperience) {
                Notify.generic('You need to answer the "Garry\'s Mod Leadership Experience" field');
            } else if(!$scope.application.willingToAddUsOnSteam) {
                Notify.generic('You need to answer the "Willing to add us on Steam" field');
            } else if(!$scope.application.whyWeShouldAccept) {
                Notify.generic('You need to answer the "Why We Should Accept You" field');
            } else {
                $mdDialog.show({
                    clickOutsideToClose: true,
                    contentElement: '#confirmSubmission'
                });
            }
        };
}]);

dtp.controller('moderatorApplicationShowCtrl', ['$scope', 'Title', 'User', 'Rest', '$routeParams', function($scope, Title, User, Rest, $routeParams) {
    var appId = $routeParams.appId;

    // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
    $scope.$watch(User.getUser, function() {
        $scope.user = User.getUser();
    }, true);

    Title.setTitle('DTP');
    Title.setPageTitle('Dinner Time Premium');

    if($scope.user) {
        $scope.authourized = false;
        Rest.get('/api/application/' + appId)
            .then(function(app) {
                if(app.authour._id == $scope.user._id) {
                    $scope.authorized = true;
                    $scope.application = app;

                    if(app.status === 'Under Review') {
                        $scope.appStatus = 33;
                    } else if(app.status === 'Awaiting Votes') {
                        $scope.appStatus = 66;
                    } else if(app.status === 'Accepted' || app.status === 'Rejected') {
                        $scope.appStatus = 100;
                    } else {
                        $scope.appStatus = 0;
                    }

                    Title.setTitle(app.authour.name + '\'s Moderator Application - DTP');
                    Title.setPageTitle(app.authour.name + '\'s Moderator Application');
                } else {
                    $scope.authorized = false;
                }
            });
    }
}]);

dtp.controller('newsIndexCtrl', ['$scope', 'Title', 'User', 'Rest', '$mdDialog', '$location',
    function($scope, Title, User, Rest, $mdDialog, $location) {
        // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
        $scope.$watch(User.getUser, function() {
            $scope.user = User.getUser();
        }, true);

        Title.setTitle('News - DTP');
        Title.setPageTitle('News');

        $scope.gotNews = false;
        function getNews() {
            $scope.gotNews = false;
            Rest.get('/api/news')
                .then(function(news) {
                    $scope.news = news;
                    $scope.gotNews = true;

                    $scope.newsMonths = {};

                    angular.forEach($scope.news, function(event) {
                        var month = moment(event.createdAt).format('MMMM YYYY');
                        $scope.newsMonths[month] = $scope.newsMonths[month] || [];
                        $scope.newsMonths[month].push(event);
                    });
                })
        }
        getNews();

        $scope.newNews = {
            title: '',
            content: ''
        };

        $scope.newNewsDialog = function() {
            $mdDialog.show({
                clickOutsideToClose: true,
                fullscreen: true,
                contentElement: '#createNews'
            });
        };

        $scope.showFormattingHelp = false;

        $scope.toggleFormattingHelp = function() {
            $scope.showFormattingHelp = !$scope.showFormattingHelp;
        };

        $scope.closeDialog = function() {
            $mdDialog.hide();
        };

        $scope.createNews = function() {
            if(!$scope.user) {
                Notify.generic('You must be logged in to create a news event');
                $mdDialog.hide();
            } else if(!$scope.newNews.title) {
                Notify.generic('Your news event needs a title!');
            } else if(!$scope.newNews.content) {
                Notify.generic('Your news event needs some content');
            } else {
                $mdDialog.hide();
                var newNews = {
                    title: $scope.newNews.title,
                    content: $scope.newNews.content,
                    authour: $scope.user
                };
                Rest.post('/api/news', newNews)
                    .then(function(res) {
                        $scope.newNews = {
                            title: '',
                            content: ''
                        };
                        $location.path('/news/' + res._id)
                    });
            }
        };
}]);

dtp.controller('newsShowCtrl', ['$scope', 'Title', 'User', 'Rest', 'Notify', '$mdDialog', '$routeParams', '$location',
function($scope, Title, User, Rest, Notify, $mdDialog, $routeParams, $location) {
    var newsId = $routeParams.newsId;

    // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
    $scope.$watch(User.getUser, function() {
        $scope.user = User.getUser();
    }, true);

    $scope.label = 1;
    $scope.gotNewsEvent = false;
    function getNewsEvent() {
        $scope.gotNewsEvent = false;
        Rest.get('/api/news/' + newsId)
            .then(function(news) {
                $scope.news = news;
                $scope.gotNewsEvent = true;

                Title.setTitle(news.title + ' - DTP');
                Title.setPageTitle(news.title);

                $scope.commentLabels = [];
                var tabs = $scope.news.comments.length / 20;

                for(var i = 0; i < tabs; i++) {
                    $scope.commentLabels.push(i + 1);
                }
                $scope.getComments($scope.label);
            })
    }
    getNewsEvent();

    $scope.gotComments = false;

    $scope.getComments = function(label) {
        $scope.gotComments = false;
        var skip = (label - 1) * 20;
        Rest.get('/api/news/' + $scope.news._id + '/comments', {skip: skip})
            .then(function(newsEvent) {
                $scope.comments = newsEvent.comments;
                $scope.label = label;
                $scope.gotComments = true;
            });
    };

    $scope.editNewsDialog = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            fullscreen: true,
            contentElement: '#editNews'
        });
    };

    $scope.showFormattingHelp = false;
    $scope.toggleFormattingHelp = function() {
        $scope.showFormattingHelp = !$scope.showFormattingHelp;
    };

    $scope.closeDialog = function() {
        $mdDialog.hide();
    };

    $scope.updateNews = function() {
        if(!$scope.user) {
            Notify.generic('You must be logged in to edit a news event');
            $mdDialog.hide();
        } else if($scope.news.title === '') {
            Notify.generic('A news event needs a title!');
        } else if($scope.news.content === '') {
            Notify.generic('A news event needs content!');
        } else {
            $mdDialog.hide();
            var updatedNews = {
                title: $scope.news.title,
                content: $scope.news.content,
                editedBy: $scope.user,
                editedAt: new Date()
            };
            Rest.put('/api/news/' + $scope.news._id, updatedNews)
                .then(function() {
                    getNewsEvent();
                });
        }
    };

    $scope.confirmDeleteNews = function() {
        $mdDialog.show({
            contentElement: '#deleteNews'
        });
    };

    $scope.deleteNews = function() {
        if(!$scope.user) {
            Notify.generic('You must be logged in to delete a news event');
            $mdDialog.hide();
        } else{
            $mdDialog.hide();
            Rest.delete('/api/news/' + $scope.news._id)
                .then(function() {
                    $location.path('/news');
                })
        }
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
            Rest.post('/api/news/' + $scope.news._id, $scope.newComment)
                .then(function() {
                    $scope.newComment.comment = '';
                    getNewsEvent();
                });
        }
    };

    $scope.editingComment = false;
    $scope.toggleEditingComment = function(id) {
        $scope.editingComment = !$scope.editingComment;
        $scope.editingCommentId = id;
    };

    $scope.updateComment = function(comment) {
        $scope.editingComment = false;
        if(!$scope.user) {
            Notify.generic('You must be logged in to update a comment');
        } else if(!comment.comment) {
            Notify.generic('Your comment needs to say something!');
        } else {
            var updatedComment = {
                comment: comment.comment,
                editedBy: $scope.user,
                editedAt: new Date()
            };
            Rest.put('/api/news/' + $scope.news._id + '/' + comment._id, updatedComment)
                .then(function() {
                    getNewsEvent();
                })
        }
    };

    var commentId = '';

    $scope.confirmDeleteComment = function(id) {
        commentId = id;
        $mdDialog.show({
            contentElement: '#deleteComment'
        });
    };

    $scope.deleteComment = function() {
        if(!$scope.user) {
            Notify.generic('You must be logged in to delete a comment');
            $mdDialog.hide();
        } else{
            $mdDialog.hide();
            Rest.delete('/api/news/' + $scope.news._id + '/' + commentId)
                .then(function() {
                    commentId = '';
                    getNewsEvent();
                })
        }
    };
}]);

dtp.controller('forumCategoryIndexCtrl', ['$scope', 'Title', 'User', 'Rest', 'Notify', '$mdDialog', '$location',
function($scope, Title, User, Rest, Notify, $mdDialog, $location) {
    // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
    $scope.$watch(User.getUser, function() {
        $scope.user = User.getUser();
    }, true);

    Title.setTitle('Forum - DTP');
    Title.setPageTitle('Forum');

    $scope.gotCategories = false;

    function getCategories() {
        $scope.gotCategories = false;
        Rest.get('/api/forum')
            .then(function(categories) {
                if(categories) {
                    $scope.categories = categories;
                    $scope.gotCategories = true;
                }
            })
    }
    getCategories();

    $scope.gotCategoryPosts = false;

    function getCategoryPosts() {
        $scope.gotCategoryPosts = false;
        Rest.get('/api/forum/allCategories')
            .then(function(categoryPosts) {
                if(categoryPosts) {
                    $scope.categoryPosts = categoryPosts;
                    $scope.gotCategoryPosts = true;
                }
            })
    }
    getCategoryPosts();

    $scope.gotRecentPosts = false;

    function getRecentPosts() {
        $scope.gotRecentPosts = false;
        Rest.get('/api/forum/recentPosts')
            .then(function(res) {
                $scope.recentPosts = res;
                $scope.gotRecentPosts = true;
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
            contentElement: '#createPost'
        });
    };

    $scope.showFormattingHelp = false;
    $scope.toggleFormattingHelp = function() {
        $scope.showFormattingHelp = !$scope.showFormattingHelp;
    };

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
            Rest.post('/api' + catPath, newPost)
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

    $scope.newCategory = '';
    $scope.newCategoryDialog = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            fullscreen: true,
            contentElement: '#createCategory'
        });
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
            Rest.post('/api/forum', newCategory)
                .then(function() {
                    $scope.newCategory = '';
                    getCategories();
                    getRecentPosts();
                    getCategoryPosts();
                });
        }
    };

    $scope.editingCategory = '';
    $scope.editCategoryDialog = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            fullscreen: true,
            contentElement: '#editCategory'
        });
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
                editedBy: $scope.user,
                editedAt: new Date()
            };
            Rest.put('/api/forum/' + $scope.editingCategory._id, updatedCategory)
                .then(function() {
                    $scope.editingCategory = '';
                    getCategories();
                    getRecentPosts();
                    getCategoryPosts();
                });
        }
    };

    $scope.confirmDeleteCategory = function() {
        $mdDialog.show({
            contentElement: '#deleteCategory'
        });
    };

    $scope.deleteCategory = function() {
        if(!$scope.user) {
            Notify.generic('You must be logged in to delete a category');
            $mdDialog.hide();
        } else {
            $scope.deleteCategory = function() {
                $mdDialog.hide();
                Rest.delete('/api/forum/' + $scope.editingCategory._id)
                    .then(function() {
                        $scope.editingCategory = '';
                        getCategories();
                        getRecentPosts();
                        getCategoryPosts();
                    })
            };
        }
    }
}]);

dtp.controller('forumPostIndexCtrl', ['$scope', 'Title', 'User', 'Rest', 'Notify', '$mdDialog', '$routeParams', '$location',
function($scope, Title, User, Rest, Notify, $mdDialog, $routeParams, $location) {
    // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
    $scope.$watch(User.getUser, function() {
        $scope.user = User.getUser();
    }, true);

    Title.setTitle('DTP');
    Title.setPageTitle('Dinner Time Premium');

    var categoryPath = $routeParams.categoryPath;
    
    $scope.gotCategory = false;
    function getCategory() {
        $scope.gotCategory = false;
        Rest.get('/api/forum/singleCategory/' + categoryPath)
            .then(function(res) {
                $scope.category = res;
                $scope.gotCategory = true;

                Title.setTitle($scope.category.title + ' - DTP');
                Title.setPageTitle($scope.category.title);

                $scope.postLabels = [];
                var tabs = $scope.category.posts.length / 20;

                for(var i = 0; i < tabs; i++) {
                    $scope.postLabels.push(i + 1);
                }
            })
    }
    getCategory();

    $scope.gotPosts = false;
    $scope.getPosts = function(label) {
        $scope.gotPosts = false;
        var skip = (label - 1) * 20;
        Rest.get('/api/forum/' + categoryPath, {skip: skip})
            .then(function(category) {
                $scope.posts = category.posts;
                $scope.gotPosts = true;
            });
    };
    $scope.getPosts(1);

    $scope.gotCategories = false;

    function getCategories() {
        $scope.gotCategories = false;
        Rest.get('/api/forum/allCategories')
            .then(function(categories) {
                if(categories) {
                    $scope.categories = categories;
                    $scope.gotCategories = true;
                }
            })
    }
    getCategories();

    $scope.gotRecentPosts = false;

    function getRecentPosts() {
        $scope.gotRecentPosts = false;
        Rest.get('/api/forum/recentPosts')
            .then(function(res) {
                $scope.recentPosts = res;
                $scope.gotRecentPosts = true;
            })
    }
    getRecentPosts();

    $scope.newPost = {
        title: '',
        content: ''
    };

    $scope.newPostDialog = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            fullscreen: true,
            contentElement: '#createPost'
        });
    };

    $scope.showFormattingHelp = false;
    $scope.toggleFormattingHelp = function() {
        $scope.showFormattingHelp = !$scope.showFormattingHelp;
    };

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
            Rest.post('/api/forum/' + categoryPath, newPost)
                .then(function(post) {
                    $scope.newPost = {
                        title: '',
                        content: ''
                    };
                    $location.path($scope.category.path + '/' + post._id)
                });
        }
    };

    $scope.$location = $location;
}]);

dtp.controller('forumPostShowCtrl', ['$scope', 'Title', 'User', 'Rest', 'Notify', '$mdDialog', '$routeParams', '$location',
function($scope, Title, User, Rest, Notify, $mdDialog, $routeParams, $location) {
    // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
    $scope.$watch(User.getUser, function() {
        $scope.user = User.getUser();
    }, true);

    Title.setTitle('DTP');
    Title.setPageTitle('Dinner Time Premium');

    var categoryPath = $routeParams.categoryPath;
    var postId = $routeParams.postId;

    $scope.label = 1;
    $scope.gotPost = false;

    function getPost() {
        $scope.gotPost = false;
        Rest.get('/api/forum/' + categoryPath + '/' + postId)
            .then(function(res) {
                $scope.post = res;
                $scope.gotPost = true;

                Title.setTitle($scope.post.title + ' - DTP');
                Title.setPageTitle($scope.post.title);

                $scope.commentLabels = [];
                var tabs = $scope.post.comments.length / 20;

                for(var i = 0; i < tabs; i++) {
                    $scope.commentLabels.push(i + 1);
                }
                $scope.getComments($scope.label);
            })
    }
    getPost();

    $scope.gotComments = false;
    $scope.getComments = function(label) {
        $scope.gotComments = false;
        var skip = (label - 1) * 20;
        Rest.get('/api/forum/' + categoryPath + '/' + $scope.post._id + '/comments', {skip: skip})
            .then(function(post) {
                $scope.comments = post.comments;
                $scope.label = label;
                $scope.gotComments = true;
            });
    };

    $scope.gotCategories = false;
    function getCategories() {
        $scope.gotCategories = false;
        Rest.get('/api/forum/allCategories')
            .then(function(categories) {
                if(categories) {
                    $scope.categories = categories;
                    $scope.gotCategories = true;
                }
            })
    }
    getCategories();

    $scope.gotRecentPosts = false;
    function getRecentPosts() {
        $scope.gotRecentPosts = false;
        Rest.get('/api/forum/recentPosts')
            .then(function(res) {
                $scope.recentPosts = res;
                $scope.gotRecentPosts = true;
            })
    }
    getRecentPosts();

    $scope.$location = $location;

    $scope.editPostDialog = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            fullscreen: true,
            contentElement: '#editPost'
        });
    };

    $scope.showFormattingHelp = false;
    $scope.toggleFormattingHelp = function() {
        $scope.showFormattingHelp = !$scope.showFormattingHelp;
    };

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
                editedBy: $scope.user,
                editedAt: new Date()
            };
            Rest.put('/api/forum/' + categoryPath + '/' + $scope.post._id, updatedPost)
                .then(function() {
                    getPost();
                });
        }
    };

    $scope.confirmDeletePost = function() {
        $mdDialog.show({
            contentElement: '#deletePost'
        });
    };

    $scope.deletePost = function() {
        if(!$scope.user) {
            Notify.generic('You must be logged in to delete a post');
            $mdDialog.hide();
        } else{
            $mdDialog.hide();
            Rest.delete('/api/forum/' + categoryPath + '/' + $scope.post._id)
                .then(function() {
                    $location.path('/forum/' + categoryPath);
                })
        }
    };

    $scope.lockPost = function(val) {
        Rest.put('/api/forum/' + categoryPath + '/' + $scope.post._id, {locked: val})
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
            contentElement: '#movePost'
        });
    };

    $scope.movePost = function() {
        if(!$scope.user) {
            Notify.generic('You must be logged in to move a post');
            $mdDialog.hide();
        } else{
            $mdDialog.hide();
            Rest.put('/api/forum/' + categoryPath + '/' + $scope.post._id + '/move', $scope.movingPost)
                .then(function() {
                    $location.path($scope.movingPost.category.path + '/' + $scope.post._id);
                    $scope.movingPost = {
                        category: '',
                        editedBy: $scope.user,
                        editedAt: new Date()
                    };
                })
        }
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
            Rest.post('/api/forum/' + categoryPath + '/' + $scope.post._id, $scope.newComment)
                .then(function() {
                    $scope.newComment.comment = '';
                    getPost();
                    getRecentPosts();
                });
        }
    };

    $scope.editingComment = false;
    $scope.toggleEditingComment = function(id) {
        $scope.editingComment = !$scope.editingComment;
        $scope.editingCommentId = id;
    };

    $scope.updateComment = function(comment) {
        $scope.editingComment = false;
        if(!$scope.user) {
            Notify.generic('You must be logged in to update a comment');
        } else if(!comment.comment) {
            Notify.generic('Your comment needs to say something!');
        } else {
            var updatedComment = {
                comment: comment.comment,
                editedBy: $scope.user,
                editedAt: new Date()
            };
            Rest.put('/api/forum/' + categoryPath + '/' + $scope.post._id + '/' + comment._id, updatedComment)
                .then(function() {
                    getPost();
                    getRecentPosts();
                })
        }
    };

    var commentId = '';
    $scope.confirmDeleteComment = function(id) {
        commentId = id;
        $mdDialog.show({
            contentElement: '#deleteComment'
        });
    };

    $scope.deleteComment = function() {
        if(!$scope.user) {
            Notify.generic('You must be logged in to delete a comment');
            $mdDialog.hide();
        } else{
            $mdDialog.hide();
            Rest.delete('/api/forum/' + categoryPath + '/' + $scope.post._id + '/' + commentId)
                .then(function() {
                    commentId = '';
                    getPost();
                    getRecentPosts();
                })
        }
    };
}]);

dtp.controller('rulesCtrl', ['$scope', 'Title', 'User', 'Rest', '$mdDialog', function($scope, Title, User, Rest, $mdDialog) {
    // Whenever something changes the front end user object, update it so we can immediately reflect the changes visually
    $scope.$watch(User.getUser, function() {
        $scope.user = User.getUser();
    }, true);

    Title.setTitle('Rules - DTP');
    Title.setPageTitle('Rules');

    function getRules() {
        Rest.get('/api/rules')
            .then(function(rules) {
                $scope.rules = rules.rules;
            });
    }
    getRules();

    $scope.editRulesDialog = function() {
        $mdDialog.show({
            clickOutsideToClose: true,
            fullscreen: true,
            contentElement: '#editRules'
        });
    };

    $scope.showFormattingHelp = false;
    $scope.toggleFormattingHelp = function() {
        $scope.showFormattingHelp = !$scope.showFormattingHelp;
    };

    $scope.closeDialog = function() {
        $mdDialog.hide();
    };

    $scope.updateRules = function() {
        if(!$scope.user) {
            Notify.generic('You must be logged in to do that');
            $mdDialog.hide();
        } else if($scope.rules === '') {
            Notify.generic('The server must have rules! That\'s a rule');
        } else {
            $mdDialog.hide();
            var updatedRules = {
                rules: $scope.rules,
                editedBy: $scope.user,
                editedAt: new Date()
            };
            Rest.put('/api/rules', updatedRules)
                .then(function() {
                    getRules();
                });
        }
    };
}]);