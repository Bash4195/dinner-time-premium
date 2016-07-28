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

        .when('/forum/:postId', {
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
}]);

dtp.service('Forum', ['$http', 'Notify', function($http, Notify) {
    // Categories
    this.getCategories = function() {
        return $http.get('/api/forum')
            .then(function(res) {
                return res.data;
            }, function(res) {
                Notify.error(res.data.error);
            });
    };

    this.newCategory = function(newCategory) {
        return $http.post('/api/forum', newCategory)
            .then(function(res) {
                return res.data;
            }, function(res) {
                Notify.error(res.data.error);
            })
    };
    
    this.updateCategory = function(id, updatedCategory) {
        console.log(id);
        console.log(updatedCategory);
        return $http.put('/api/forum/' + id, updatedCategory)
            .then(function(res) {
                return res.data;
            }, function(res) {
                Notify.error(res.data.error);
            })
    };
    
    this.deleteCategory = function(id) {
        return $http.delete('/api/forum/' + id)
            .then(function(res) {
                return res.data;
            }, function(res) {
                Notify.error(res.data.error);
            })
    };

    // Posts
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
// Used for the nav and anything on all pages
dtp.controller('mainCtrl', ['$scope', 'Title', '$location', 'User', '$mdSidenav', '$mdMedia',
    function($scope, Title, $location, User, $mdSidenav, $mdMedia) {
        $scope.Title = Title;

        $scope.$mdMedia = $mdMedia;

        if(User.currentUser === '') {
            User.getCurrentUser()
                .then(function(user) {
                    if(user) {
                        $scope.user = user;
                    }
                });
        } else {
            $scope.user = User.currentUser;
        }

        $scope.lockLeft = true;
        $scope.lockOnlineUsers = true;
        getUsers();

        $scope.toggleLeft = function() {
            $mdSidenav('left').toggle();
        };
        
        $scope.toggleOnlineUsers = function() {
            $mdSidenav('onlineUsers').toggle();
            if($mdSidenav('onlineUsers').isOpen()) {
                getUsers();
            }
        };
        
        $scope.toggleLockOnlineUsers = function() {
            $scope.lockOnlineUsers = !$scope.lockOnlineUsers;
            if($scope.lockOnlineUsers) {
                getUsers();
            }
        };

        $scope.toggleLeftAndOnlineUsers = function() {
            $scope.toggleLeft();
            $scope.toggleOnlineUsers();
        };

        function getUsers() {
            User.getOnlineUsers()
                .then(function(users) {
                    $scope.onlineUsers = users;
                })
        }

    // Used to set the active nav button
    $scope.activeNav = function (path) {
        return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    };
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

dtp.controller('forumCategoryIndexCtrl', ['$scope', 'Title', 'User', 'Forum', 'Notify', '$mdDialog', '$location',
    function($scope, Title, User, Forum, Notify, $mdDialog, $location) {

        Title.setTitle('DTP - Forum');
        Title.setPageTitle('Forum');

        if(User.currentUser !== '') {
            $scope.user = User.currentUser;
        }

        function getCategories() {
            Forum.getCategories()
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
                Forum.newCategory(newCategory)
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
                Forum.updateCategory($scope.editingCategory._id, updatedCategory)
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
            Forum.deleteCategory($scope.editingCategory._id)
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