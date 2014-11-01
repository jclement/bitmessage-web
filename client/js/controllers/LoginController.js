app.controller('LoginController', function (authentication, $location, $scope) {

    $scope.loginForm = {};
    $scope.loginError = null;

    $scope.login = function () {
        $scope.loginError = null;

        authentication.login($scope.loginForm.username, $scope.loginForm.password)
            .then(function () {
                $location.path("/");
            }, function (message) {
                $scope.loginError = message;
                $scope.loginForm.password = null;
            });
    };

});
