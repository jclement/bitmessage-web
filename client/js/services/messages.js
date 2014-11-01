angular.module('messages', ['authentication', 'ngNotify'])
    .factory('messages', function (authentication, $http, $interval) {
        var messages = [];

        var refresh = function () {
            if (authentication.isAuthenticated()) {
                $http.post('api/bm/messages/inbox/list', {token: authentication.getToken()})
                    .success(function (data) {
                        _.each(data, function (message) {
                            message.receivedTime = Date.parse(message.receivedTime);
                        });
                        messages = data;
                    });
            }
        };

        authentication.onStateChange(refresh);
        $interval(refresh, 5000);

        return {
            refresh: refresh,
            list: function () {
                return messages;
            },
            unreadCount: function () {
                if (authentication.isAuthenticated()) {
                    return _.filter(messages, function (m) {
                        return m.read === 0;
                    }).length;
                }
                else {
                    return null;
                }
            }
        };

    });