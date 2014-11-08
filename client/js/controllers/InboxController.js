app.controller('InboxController', function (authentication, $http, $location, $notify, $scope) {

    $scope.deleteMessage = function(message) {
        $http.post('api/bm/messages/inbox/delete', {id: message.msgid, token: authentication.getToken()})
            .success(function() {
                $notify.warning('Message successfully deleted.');
                $location.path("#/index");
            });
    };

});
