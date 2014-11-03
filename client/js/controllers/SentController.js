app.controller('SentController', function ($scope, $http, authentication) {

    $scope.sentMessages = [];

    $http.post('api/bm/messages/sent/list', {token: authentication.getToken()})
        .success(function (data) {
            _.each(data, function (message) {
                message.lastActionTime = Date.parse(message.lastActionTime);
            });
            $scope.sentMessages = data;
        });

});
