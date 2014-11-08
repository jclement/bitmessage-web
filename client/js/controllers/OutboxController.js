app.controller('OutboxController', function ($scope, $http, authentication) {

    $scope.outboxMessages = [];

    $http.post('api/bm/messages/outbox/list', {token: authentication.getToken()})
        .success(function (data) {
            _.each(data, function (message) {
                message.lastActionTime = Date.parse(message.lastActionTime);
            });
            $scope.outboxMessages = data;
        });

});
