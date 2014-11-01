var app = angular.module('bitmessageApp', ['ngNotify','LocalStorageModule']);

app.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix("bm");
}]);

app.controller('bitmessageController', function ($notify, $http, $timeout, $interval, localStorageService) {

    var ctrl = this;

    /* ====== AUTHENTICATION =============================================== */

    var auth = null;

    (function () {
        ctrl.initialized = false;
        // if we have pre-existing token, verify it to see if it's still good.
        var savedToken = localStorageService.get('auth');
        if (savedToken) {
            $http.post('api/auth/verify', {token: savedToken.token})
                .success(function (data) {
                    if (data.status) {
                        auth = savedToken;
                    }
                    ctrl.initialized = true;
                    refresh();
                })
        } else {
            ctrl.initialized = true;
        }
    })();

    ctrl.loginForm = {};
    ctrl.loginError = null;

    ctrl.user = function () {
        return auth && auth.username;
    };

    ctrl.isAuthenticated = function () {
        return !!auth;
    };

    ctrl.login = function () {
        ctrl.loginError = null;
        $http.post('api/auth/login', ctrl.loginForm)
            .success(function (data) {
                if (data.status) {
                    auth = {
                        token: data.token,
                        username: ctrl.loginForm.username
                    };
                    localStorageService.set('auth', auth);
                } else {
                  ctrl.loginError = data.message;
                }
                ctrl.loginForm = {};
                refresh();
            });
    };

    ctrl.deleteMessage = function(message) {
        $http.post('api/bm/messages/inbox/delete', {id: message.msgid, token: auth.token})
            .success(function() {
                $notify.warning('Message successfully deleted.');
                refresh();
            });
    };

    ctrl.logout = function () {
        auth = null;
        localStorageService.remove('auth');
    };

    ctrl.messages = [];
    ctrl.addresses = [];
    ctrl.addressbook = [];

    ctrl.unreadCount = function() {
        return _.filter(ctrl.messages, function(f) {return f.read === 0;}).length;
    };

    ctrl.lookup = function(address) {
        var displayAddress = null;
        _.each(ctrl.addresses, function(a) {
            if (a.address === address) {
                displayAddress = a.label;
            }
        });
        if (!displayAddress) {
            _.each(ctrl.addressbook, function (a) {
                if (a.address === address) {
                    displayAddress = a.label;
                }
            });
        }
        return displayAddress || address;
    };

    var refresh = function() {
        if (!!auth) {
            var previousCount = ctrl.unreadCount();

            $http.post('api/bm/messages/inbox/list', {token: auth.token})
                .success(function(data) {
                    _.each(data, function(message) {
                       message.receivedTime = Date.parse(message.receivedTime);
                    });
                    ctrl.messages = data;
                    var newMessages = ctrl.unreadCount() - previousCount;
                    if (newMessages > 0) {
                        $notify.success(newMessages + " new messages.");
                    }
                });
            $http.post('api/bm/addresses/list', {token: auth.token})
                .success(function(data) {
                    ctrl.addresses = data;
                });
            $http.post('api/bm/addressbook/list', {token: auth.token})
                .success(function(data) {
                    ctrl.addressbook = data;
                });

        }
        $timeout(refresh, 5000);
    };

});
