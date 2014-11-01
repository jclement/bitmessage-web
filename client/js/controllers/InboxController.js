app.controller('InboxController', function ($scope, $notify, $http, $timeout, authentication, messages) {

    $scope.messages = messages.list;

    $scope.lookup = function(address) {
        return address;
    };

    $scope.openMessage = function(message) {
        $scope.message = message;
    };

    messages.refresh();

    /*
    var refresh = function() {
            var previousCount = $scope.unreadCount();

            $http.post('api/bm/messages/inbox/list', {token: authentication.getToken()})
                .success(function(data) {
                    _.each(data, function(message) {
                        message.receivedTime = Date.parse(message.receivedTime);
                    });
                    $scope.messages = data;
                    var newMessages = $scope.unreadCount() - previousCount;
                    if (newMessages > 0) {
                        $notify.success(newMessages + " new messages.");
                        $rootScope.unreadCount = newMessages;
                    }
                });
            $http.post('api/bm/addresses/list', {token: authentication.getToken()})
                .success(function(data) {
                    $scope.addresses = data;
                });
            $http.post('api/bm/addressbook/list', {token: authentication.getToken()})
                .success(function(data) {
                    $scope.addressbook = data;
                });

        console.log('refresh');
        $timeout(refresh, 5000);
    };
    */


});
