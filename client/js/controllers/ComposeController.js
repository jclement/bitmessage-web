app.controller('ComposeController', function (authentication, $notify, $http, $location, $scope, $routeParams) {

    $scope.addressbook = [];
    $scope.identities = [];
    $scope.sending = false;
    $scope.data = {};

    var type = $routeParams.type;
    var id = $routeParams.id;

    if (type === 'to') {
        $scope.data.toAddress = id;
    }

    if (type === 'reply') {
        $http.post('api/bm/messages/inbox/read', {
            token: authentication.getToken(),
            id: id,
            markRead: false
        })
            .success(function (data) {
                $scope.data.toAddress = data.fromAddress;
                $scope.data.fromAddress = data.toAddress;
                $scope.data.subject = data.subject;
                $scope.data.message = '\n\n------------------------------------------------------\n' + data.message;
            });
    }

    $scope.GetRecipientLabel = function() {
        var record = _.findWhere($scope.addressbook, {address: $scope.data.toAddress});
        return record ? record.label : null;
    };

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
            toAddress: $scope.data.toAddress,
            fromAddress: $scope.data.fromAddress,
            subject: $scope.data.subject,
            message: $scope.data.message
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
