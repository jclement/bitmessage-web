angular.module('authentication', ['LocalStorageModule'])
    .factory('authentication', function (localStorageService, $http, $q, $interval, $timeout) {
        var state = null;
        var listeners = [];

        var setState = function(newState) {
            state = newState;
            localStorageService.set('auth', newState);
            _.each(listeners, function(listener) {
                listener(!!state);
            })
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
                                setState(savedToken);
                            }
                            deferred.resolve();
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
                            setState({
                                token: data.token,
                                username: username
                            });
                            deferred.resolve();
                        } else {
                            deferred.reject(data.message);
                        }
                    });
                return deferred.promise;
            },
            logout: function() {
                setState(null);
            }
        };
    });