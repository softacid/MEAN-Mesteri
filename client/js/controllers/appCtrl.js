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