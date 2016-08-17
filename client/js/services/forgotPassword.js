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