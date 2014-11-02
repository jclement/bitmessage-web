app.controller('ComposeController', function (authentication, $notify, $http, $location, $scope) {

    $scope.addressbook = [];
    $scope.identities = [];
    $scope.sending = false;

    $http.post('api/bm/addressbook/list', {token: authentication.getToken()})
        .success(function (data) {
            $scope.addressbook = data;
        });

    $http.post('api/bm/addresses/list', {token: authentication.getToken()})
        .success(function (data) {
            $scope.identities = _.filter(data, function(i) {return i.enabled;});
        });

    $scope.send = function() {
        $http.post('api/bm/messages/send', {
            token: authentication.getToken(),
            toAddress: $scope.form.toAddress,
            fromAddress: $scope.form.fromAddress,
            subject: $scope.form.subject,
            message: $scope.form.body
        })
            .success(function (ack) {
                $location.path("#/inbox");
                $notify.success("Message queued for delivery (" + ack + ").");
            })
            .error(function(message) {
                $notify.error(message);
            });

    };
});
