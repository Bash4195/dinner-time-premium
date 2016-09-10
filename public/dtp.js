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
                    return User.getCurrentUser();
                }
            }
        })

        //User Routes
        .when('/users', {
            templateUrl: 'user/userIndex.html',
            controller: 'userIndexCtrl',
            resolve: {
                user: function(User) {
                    return User.getCurrentUser();
                }
            }
        })
        .when('/user/:userId', {
            templateUrl: 'user/userShow.html',
            controller: 'userShowCtrl',
            resolve: {
                user: function(User) {
                    return User.getCurrentUser();
                }
            }
        })
            
        // Mod Application Routes
        .when('/apply', {
            templateUrl: 'apply/moderatorApplicationRequirements.html',
            controller: 'moderatorApplicationRequirementsCtrl',
            resolve: {
                user: function(User) {
                    return User.getCurrentUser();
                }
            }
        })
            
        .when('/apply/:userId', {
            templateUrl: 'apply/moderatorApplicationCreate.html',
            controller: 'moderatorApplicationCreateCtrl',
            resolve: {
                user: function(User) {
                    return User.getCurrentUser();
                }
            }
        })
        
        .when('/application/:appId', {
            templateUrl: 'applications/moderatorApplicationShow.html',
            controller: 'moderatorApplicationShowCtrl',
            resolve: {
                user: function(User) {
                    return User.getCurrentUser();
                }
            }
        })
            
        // News Routes
        .when('/news', {
            templateUrl: 'news/newsIndex.html',
            controller: 'newsIndexCtrl',
            resolve: {
                user: function(User) {
                    return User.getCurrentUser();
                }
            }
        })
        .when('/news/:newsId', {
            templateUrl: 'news/newsShow.html',
            controller: 'newsShowCtrl',
            resolve: {
                user: function(User) {
                    return User.getCurrentUser();
                }
            }
        })

        // Forum Routes
        .when('/forum', {
            templateUrl: 'forum/category/forumCategoryIndex.html',
            controller: 'forumCategoryIndexCtrl',
            resolve: {
                user: function(User) {
                    return User.getCurrentUser();
                }
            }
        })
        .when('/forum/:categoryPath', {
            templateUrl: 'forum/post/forumPostIndex.html',
            controller: 'forumPostIndexCtrl',
            resolve: {
                user: function(User) {
                    return User.getCurrentUser();
                }
            }
        })
        .when('/forum/:categoryPath/:postId', {
            templateUrl: 'forum/post/forumPostShow.html',
            controller: 'forumPostShowCtrl',
            resolve: {
                user: function(User) {
                    return User.getCurrentUser();
                }
            }
        })

        // Rules
        .when('/rules', {
            templateUrl: 'rules/rules.html',
            controller: 'rulesCtrl',
            resolve: {
                user: function(User) {
                    return User.getCurrentUser();
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
    // This is called on every page the user loads up to keep the user as up to date as possible! Mainly due to permission updates
    this.getCurrentUser = function() {
        return $http.get('/auth/getCurrentUser')
            .then(function(res) {
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
    this.getThings = function(path, params) {
        return $http.get(path, {params: params})
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
    this.newThing = function(path, newThing, params) {
        return $http.post(path, newThing, {params: params})
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
    this.getThing = function(path, params) {
        return $http.get(path, {params: params})
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
    this.updateThing = function(path, updatedThing, params) {
        return $http.put(path, updatedThing, {params: params})
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
    this.deleteThing = function(path, params) {
        return $http.delete(path, {params: params})
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
    $scope.$mdMedia = $mdMedia; // For opening menus from html

    $scope.gotOnlineUsers = false;

    User.getCurrentUser()
        .then(function(user) {
            if(user) { // Check for user first because it could be empty! No one HAS to login
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

dtp.controller('userIndexCtrl', ['$scope', 'Title', 'Rest', '$location', function($scope, Title, Rest, $location) {
    Title.setTitle('DTP - Users');
    Title.setPageTitle('Search Users');

    $scope.search = '';

    $scope.gotUsers = false;

    // Used for pagination but angular material tabs cause so many $digests that the page freezes with enough tabs
    // $scope.retrieveUsers = function() {
    //     $scope.gotUsers = false;
    //
    //     Rest.getThing('/api/users/count', {search: $scope.search})
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
        Rest.getThings('/api/users', {search: $scope.search})//, skip: skip}) // Pagination
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

dtp.controller('userShowCtrl', ['$scope', 'Title', 'User', 'user', 'Rest', 'Ranks', '$routeParams',
    function($scope, Title, User, user, Rest, Ranks, $routeParams) {

        var userId = $routeParams.userId;
        
        $scope.user = user;
        
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
                        realName: $scope.userProfile.realName,
                        gender: $scope.userProfile.gender,
                        age: $scope.userProfile.age,
                        birthday: new Date($scope.userProfile.birthday),
                        location: $scope.userProfile.location,
                        occupation: $scope.userProfile.occupation
                    };
                    
                    if(!$scope.userProfile.birthday) {
                        $scope.about.birthday = new Date;
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

        $scope.saveProfile = function(userData) {
            Rest.updateThing('/api/user/' + userId, userData)
                .then(function() {
                    if(userData === $scope.bio) {
                        $scope.editingBio = false;
                    } else {
                        $scope.editingAbout = false;
                    }
                    $scope.getUserProfile();

                    User.getCurrentUser() // Using this instead of a returned user to keep the front end updated with the latest permissions
                        .then(function(user) {
                            $scope.user = user;
                        })
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
            Rest.updateThing('/api/user/' + userId + '/updatePermissions', $scope.permissions)
                .then(function() {
                    $scope.editingPermissions = false;
                    $scope.getUserProfile();
                    User.getCurrentUser()
                        .then(function(user) {
                            $scope.user = user;
                        })
                })
        };
}]);

dtp.controller('moderatorApplicationRequirementsCtrl', ['$scope', 'Title', 'user', 'Notify', '$location', function($scope, Title, user, Notify, $location) {
    Title.setTitle('Moderator Application Requirements');
    Title.setPageTitle('Moderator Application Requirements');

    $scope.user = user;

    $scope.terms = {accepted: false};

    $scope.createApplication = function() {
        if($scope.terms.accepted) {
            $location.path('/application/' + user._id)
        } else {
            Notify.generic('You must accept the terms first!');
        }
    }
}]);

dtp.controller('moderatorApplicationCreateCtrl', ['$scope', 'Title', 'user', 'Notify', 'Rest', '$mdDialog', '$location',
    function($scope, Title, user, Notify, Rest, $mdDialog, $location) {
        $scope.user = user;

        Title.setTitle(user.name + '\'s Moderator Application');
        Title.setPageTitle(user.name + '\'s Moderator Application');

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
            Rest.newThing('/api/application/' + $scope.user._id, $scope.application)
                .then(function(app) {
                    $location.path('/application/' + app._id);
                })
        };

        $scope.confirmSubmission = function() {
            // Do checking here so we don't unnecessarily show the dialog
            if(!$scope.user) {
                Notify.generic('You must be logged in to do that');
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

dtp.controller('moderatorApplicationShowCtrl', ['$scope', 'Title', 'user', 'Rest', function($scope, Title, user, Rest) {
    $scope.user = user;

    // Get application
    // Set these to the authours name
    Title.setTitle(app.authour.name + '\'s Moderator Application');
    Title.setPageTitle(app.authour.name + '\'s Moderator Application');
}]);

dtp.controller('newsIndexCtrl', ['$scope', 'Title', 'user', 'Rest', '$mdDialog', '$location', 
    function($scope, Title, user, Rest, $mdDialog, $location) {
        Title.setTitle('DTP - News');
        Title.setPageTitle('News');
    
        $scope.user = user;
        
        $scope.gotNews = false;
        function getNews() {
            $scope.gotNews = false;
            Rest.getThings('/api/news')
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
                Rest.newThing('/api/news', newNews)
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

dtp.controller('newsShowCtrl', ['$scope', 'Title', 'user', 'Rest', 'Notify', '$mdDialog', '$routeParams', '$location',
function($scope, Title, user, Rest, Notify, $mdDialog, $routeParams, $location) {
    var newsId = $routeParams.newsId;

    $scope.user = user;

    $scope.label = 1;
    $scope.gotNewsEvent = false;
    function getNewsEvent() {
        $scope.gotNewsEvent = false;
        Rest.getThing('/api/news/' + newsId)
            .then(function(news) {
                $scope.news = news;
                $scope.gotNewsEvent = true;

                Title.setTitle(news.title);
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
        Rest.getThings('/api/news/' + $scope.news._id + '/comments', {skip: skip})
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
            Rest.updateThing('/api/news/' + $scope.news._id, updatedNews)
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
            Rest.deleteThing('/api/news/' + $scope.news._id)
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
            Rest.newThing('/api/news/' + $scope.news._id, $scope.newComment)
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
            Rest.updateThing('/api/news/' + $scope.news._id + '/' + comment._id, updatedComment)
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
            Rest.deleteThing('/api/news/' + $scope.news._id + '/' + commentId)
                .then(function() {
                    commentId = '';
                    getNewsEvent();
                })
        }
    };
}]);

dtp.controller('forumCategoryIndexCtrl', ['$scope', 'Title', 'user', 'Rest', 'Notify', '$mdDialog', '$location',
function($scope, Title, user, Rest, Notify, $mdDialog, $location) {
    Title.setTitle('DTP - Forum');
    Title.setPageTitle('Forum');

    $scope.user = user;

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

    $scope.gotCategoryPosts = false;

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

    $scope.gotRecentPosts = false;

    function getRecentPosts() {
        $scope.gotRecentPosts = false;
        Rest.getThings('/api/forum/recentPosts')
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
            Rest.newThing('/api/forum', newCategory)
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
            Rest.updateThing('/api/forum/' + $scope.editingCategory._id, updatedCategory)
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
}]);

dtp.controller('forumPostIndexCtrl', ['$scope', 'Title', 'user', 'Rest', 'Notify', '$mdDialog', '$routeParams', '$location',
function($scope, Title, user, Rest, Notify, $mdDialog, $routeParams, $location) {

    var categoryPath = $routeParams.categoryPath;

    $scope.user = user;

    function getCategory() {
        Rest.getThing('/api/forum/singleCategory/' + categoryPath)
            .then(function(res) {
                $scope.category = res;

                Title.setTitle($scope.category.title);
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
        Rest.getThings('/api/forum/' + categoryPath, {skip: skip})
            .then(function(category) {
                $scope.posts = category.posts;
                $scope.gotPosts = true;
            });
    };
    $scope.getPosts(1);

    $scope.gotCategories = false;

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

    $scope.gotRecentPosts = false;

    function getRecentPosts() {
        $scope.gotRecentPosts = false;
        Rest.getThings('/api/forum/recentPosts')
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

    $scope.$location = $location;
}]);

dtp.controller('forumPostShowCtrl', ['$scope', 'Title', 'user', 'Rest', 'Notify', '$mdDialog', '$routeParams', '$location',
function($scope, Title, user, Rest, Notify, $mdDialog, $routeParams, $location) {

    var categoryPath = $routeParams.categoryPath;
    var postId = $routeParams.postId;

    $scope.user = user;

    $scope.label = 1;
    $scope.gotPost = false;

    function getPost() {
        $scope.gotPost = false;
        Rest.getThing('/api/forum/' + categoryPath + '/' + postId)
            .then(function(res) {
                $scope.post = res;
                $scope.gotPost = true;

                Title.setTitle($scope.post.title);
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
        Rest.getThings('/api/forum/' + categoryPath + '/' + $scope.post._id + '/comments', {skip: skip})
            .then(function(post) {
                $scope.comments = post.comments;
                $scope.label = label;
                $scope.gotComments = true;
            });
    };
    
    $scope.gotCategories = false;

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
    
    $scope.gotRecentPosts = false;

    function getRecentPosts() {
        $scope.gotRecentPosts = false;
        Rest.getThings('/api/forum/recentPosts')
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
            Rest.updateThing('/api/forum/' + categoryPath + '/' + $scope.post._id, updatedPost)
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
            Rest.deleteThing('/api/forum/' + categoryPath + '/' + $scope.post._id)
                .then(function() {
                    $location.path('/forum/' + categoryPath);
                })
        }
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
            contentElement: '#movePost'
        });
    };

    $scope.movePost = function() {
        if(!$scope.user) {
            Notify.generic('You must be logged in to move a post');
            $mdDialog.hide();
        } else{
            $mdDialog.hide();
            Rest.updateThing('/api/forum/' + categoryPath + '/' + $scope.post._id + '/move', $scope.movingPost)
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
            Rest.newThing('/api/forum/' + categoryPath + '/' + $scope.post._id, $scope.newComment)
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
            Rest.updateThing('/api/forum/' + categoryPath + '/' + $scope.post._id + '/' + comment._id, updatedComment)
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
            Rest.deleteThing('/api/forum/' + categoryPath + '/' + $scope.post._id + '/' + commentId)
                .then(function() {
                    commentId = '';
                    getPost();
                    getRecentPosts();
                })
        }
    };
}]);

dtp.controller('rulesCtrl', ['$scope', 'Title', 'user', 'Rest', '$mdDialog', function($scope, Title, user, Rest, $mdDialog) {
    Title.setTitle('DTP - Rules');
    Title.setPageTitle('Rules');

    $scope.user = user;
    
    function getRules() {
        Rest.getThing('/api/rules')
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
            Rest.updateThing('/api/rules', updatedRules)
                .then(function() {
                    getRules();
                });
        }
    };
}]);