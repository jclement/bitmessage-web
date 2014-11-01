angular.module('authentication', ['LocalStorageModule'])
    .factory('authentication', function (localStorageService, $http, $q, $interval, $timeout) {
        var state = null;
        var listeners = [];

        var notifyState = function() {
            var promises = [];
            _.each(listeners, function(listener) {
                promises.push(listener());
            });
            return $q.all(promises);
        };

        return {
            init: function() {
                var deferred = $q.defer();
                // if we have pre-existing token, verify it to see if it's still good.
                var savedToken = localStorageService.get('auth');
                if (savedToken) {
                    $http.post('api/auth/verify', {token: savedToken.token})
                        .success(function (data) {
                            if (data.status) {
                                state = savedToken;
                            }
                            notifyState().then(function() {
                                deferred.resolve();
                            });
                        })
                } else {
                    deferred.resolve();
                }
                return deferred.promise;
            },
            onStateChange: function(listener) {
                listeners.push(listener);
            },
            isInitialized: function () {
                return initialized;
            },
            isAuthenticated: function () {
                return !!state;
            },
            getUsername: function() {
                return state ? state.username : null;
            },
            getToken: function () {
                return state.token;
            },
            login: function(username, password) {
                var deferred = $q.defer();
                $http.post('api/auth/login', {
                    username: username,
                    password: password
                })
                    .success(function (data) {
                        if (data.status) {
                            state = {
                                token: data.token,
                                username: username
                            };
                            localStorageService.set('auth', state);
                            notifyState().then(function() {
                                deferred.resolve();
                            });
                        } else {
                            deferred.reject(data.message);
                        }
                    });
                return deferred.promise;
            },
            logout: function() {
                var deferred = $q.defer();
                state = null;
                localStorageService.remove('auth');
                notifyState().then(function() {
                    deferred.resolve();
                });
                return deferred.promise;
            }
        };
    });