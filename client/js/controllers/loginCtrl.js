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