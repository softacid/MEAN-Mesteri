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