app.controller('ViewController', function (authentication, $notify, $http, $location, $scope, $routeParams) {
    var msgid = $routeParams.msgid;
    $scope.message = {};

    $http.post('api/bm/messages/inbox/read', {
        token: authentication.getToken(),
        id: msgid
    })
        .success(function (data) {
            $scope.message = data;
        });

    $scope.deleteMessage = function() {
        $http.post('api/bm/messages/inbox/delete', {id: msgid, token: authentication.getToken()})
            .success(function(data) {
                $notify.warning('Message successfully deleted.');
                $location.path("#/index");
            });
    };

    $scope.replyMessage = function() {

    };
});
