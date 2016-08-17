angular.module('home', []);
angular.module('login', []);
angular.module('adminHome', []);
angular.module('authService', []);

angular.module('mesteriApp.controllers', []);
angular.module('mesteriApp.services', []);
angular.module('mesteriApp.directives', []);
angular.module('mesteriApp.filters', []);

// Declare app level module which depends on filters, and services
angular.module('mesteriApp', [
    'mesteriApp.controllers',
    'mesteriApp.services',
    'mesteriApp.directives',
    'mesteriApp.filters',

    // AngularJS
    'ngRoute',

    // All modules are being loaded here but EMPTY - they will be filled with controllers and functionality
    'home',
    'login',
    'adminHome'
]);

// configure our routes
var app = angular.module('mesteriApp').config([
    '$routeProvider', '$locationProvider', '$httpProvider',
    function ($routeProvider, $locationProvider, $httpProvider) {
        'use strict';
        $locationProvider.html5Mode(true);

        // attach our auth interceptor to the http requests
        $httpProvider.interceptors.push('AuthInterceptor');

        $routeProvider
            // route for the home page
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'homeCtrl',
                access: {
                    auth: false
                }
            })
            .when('/dashboard', {
                templateUrl: 'views/dashboard.html',
                controller: 'dashboardCtrl',
                access: {
                    auth: true
                }
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'loginCtrl',
                access: {
                    auth: false
                }
            })
            .when('/forgot', {
                templateUrl: 'views/forgot.html',
                controller: 'loginCtrl',
                access: {
                    auth: false
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    }
]);


app.run(function($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and the user is not logged in
    $rootScope.$on('$routeChangeStart', function(event, next) {
        if (next.$$route.access.auth) {
            if (!Auth.isLoggedIn()) {
                event.preventDefault();
                $location.path('/login')
            }
        }
    });
});
/*global angular*/

angular.module('mesteriApp.controllers').controller('appCtrl', [
    '$scope', '$location', 'Auth',
    function ($scope, $location, Auth) {
        'use strict';
        $scope._init = function () {
            $scope.isLoggedIn = Auth.isLoggedIn();

            /**
             * Navigation helper
             * @param {String} page
             */
            $scope.goTo = function (page) {
                $location.path(page);
            };

            $scope.doLogout = function() {
                Auth.logout();
                $scope.user = '';
                $location.path('/login');
            };
        };

        // DESTRUCTOR
        $scope.$on('$destroy', function () {

        });

        // Run constructor
        $scope._init();

        if (mesteriAppConfig.debug) {
            console.log('info', '[AppCtrl] initialized');
        }
    }
]);
/*global angular*/

angular.module('mesteriApp.controllers').controller('dashboardCtrl', [
    '$rootScope', '$scope','Auth',
    function ($rootScope, $scope, Auth) {
        'use strict';
        $scope._init = function () {

            // check to see if a user is logged in on every request
            $rootScope.$on('$routeChangeStart', function () {
                $scope.isLoggedIn = Auth.isLoggedIn();

                // get user information on page load
                Auth.getUser()
                    .then(function (data) {
                        $scope.user = data.data;
                    });
            });

        };

        // DESTRUCTOR
        $scope.$on('$destroy', function () {

        });

        // Run constructor
        $scope._init();

        if (mesteriAppConfig.debug) {
            console.log('info', '[HomeCtrl] initialized');
        }
    }
]);
/*global angular*/

angular.module('mesteriApp.controllers').controller('homeCtrl', [
    '$rootScope', '$scope','Auth',
    function ($rootScope, $scope, Auth) {
        'use strict';
        $scope._init = function () {

            // check to see if a user is logged in on every request
            $rootScope.$on('$routeChangeStart', function () {
                $scope.isLoggedIn = Auth.isLoggedIn();

                // get user information on page load
                Auth.getUser()
                    .then(function (data) {
                        $scope.user = data.data;
                    });
            });

        };

        // DESTRUCTOR
        $scope.$on('$destroy', function () {

        });

        // Run constructor
        $scope._init();

        if (mesteriAppConfig.debug) {
            console.log('info', '[HomeCtrl] initialized');
        }
    }
]);
/*global angular*/

angular.module('mesteriApp.controllers').controller('loginCtrl', [
    '$rootScope', '$scope','Auth', '$location',
    function ($rootScope, $scope, Auth, $location) {
        'use strict';
        $scope._init = function () {

            $scope.doLogin = function(user, pass){
                $scope.processing = true;

                Auth.login(user, pass)
                    .success(function(data) {
                        $scope.processing = false;

                        // if a user successfully logs in, redirect to users page
                        if (data.success)
                            $location.path('/dashboard');
                        else
                            $scope.error = data.message;

                    });
            };


            $scope.createUser = function() {
                Auth.createUser();
            };
        };

        // DESTRUCTOR
        $scope.$on('$destroy', function () {
            $scope.loginScreen = true;
        });

        // Run constructor
        $scope._init();

        if (mesteriAppConfig.debug) {
            console.log('info', '[LoginCtrl] initialized');
        }
    }
]);
angular.module('mesteriApp.services')

// ===================================================
// auth factory to login and get information
// inject $http for communicating with the API
// inject $q to return promise objects
// inject AuthToken to manage tokens
// ===================================================
    .factory('Auth', function($http, $q, AuthToken) {

        // create auth factory object
        var authFactory = {};

        // log a user in
        authFactory.login = function(username, password) {

            // return the promise object and its data
            return $http.post('/api/authenticate', {
                username: username,
                password: password
            })
                .success(function(data) {
                    AuthToken.setToken(data.token);
                    return data;
                });
        };

        // log a user out by clearing the token
        authFactory.logout = function() {
            // clear the token
            AuthToken.setToken();
        };

        // check if a user is logged in
        // checks if there is a local token
        authFactory.isLoggedIn = function() {
            if (AuthToken.getToken())
                return true;
            else
                return false;
        };

        // get the logged in user
        authFactory.getUser = function() {
            if (AuthToken.getToken())
                return $http.get('/api/me', { cache: true });
            else
                return $q.reject({ message: 'User has no token.' });
        };

        authFactory.createUser = function() {
            $http.post('/api/register');
        };

        // return auth factory object
        return authFactory;

    })

    // ===================================================
    // factory for handling tokens
    // inject $window to store token client-side
    // ===================================================
    .factory('AuthToken', function($window) {

        var authTokenFactory = {};

        // get the token out of local storage
        authTokenFactory.getToken = function() {
            return $window.localStorage.getItem('token');
        };

        // function to set token or clear token
        // if a token is passed, set the token
        // if there is no token, clear it from local storage
        authTokenFactory.setToken = function(token) {
            if (token)
                $window.localStorage.setItem('token', token);
            else
                $window.localStorage.removeItem('token');
        };

        return authTokenFactory;

    })

    // ===================================================
    // application configuration to integrate token into requests
    // ===================================================
    .factory('AuthInterceptor', function($q, $location, AuthToken) {
        var interceptorFactory = {};

        // this will happen on all HTTP requests
        interceptorFactory.request = function(config) {

            // grab the token
            var token = AuthToken.getToken();

            // if the token exists, add it to the header as x-access-token
            if (token)
                config.headers.Authorization = token;

            return config;
        };

        // happens on response errors
        interceptorFactory.responseError = function(response) {

            // if our server returns a 403 forbidden response
            if (response.status == 403) {
                AuthToken.setToken();
                $location.path('/login');
            }

            // return the errors from the server as a promise
            return $q.reject(response);
        };

        return interceptorFactory;

    });
/*global angular*/
angular.module('mesteriApp.services').factory('forgotPassword',[
    '$http', '$q',
    function ($http, $q) {
    var service = {};
    var URI = {
        forgotPassword: '/api/forgot/',
        resetPassword: '/api/reset/'
    };

    var forgotPassword = function(email) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: forgotPassword,
            data: {
                'email' : email
            }
        }).success(function(response) {
            deferred.resolve(response);
        }).error(function(error) {
            console.log(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
        var resetPassword = function(token, newPassword) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: resetPassword + token,
                data:{
                    'password': newPassword
                }
            }).success(function(response) {
                deferred.resolve(response);
            }).error(function(error) {
                console.log(error);
                deferred.reject(error);
            });
            return deferred.promise;
        };

        return service;
}]);