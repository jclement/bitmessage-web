app.controller('IdentitiesController', function (authentication, $http, $location, $scope) {

    $scope.identities = [];
    $scope.busy = false;

    var refresh = function () {
        $http.post('api/bm/addresses/list', {token: authentication.getToken()})
            .success(function (data) {
                $scope.identities = data;
            });
    };
    refresh();

    $scope.newIdentity = function (label) {
        $scope.busy = true;
        $http.post('api/bm/addresses/createRandom', {token: authentication.getToken(), label: label})
            .success(function (data) {
                $scope.identities.push(data);
                $scope.busy = false;
            });
    };

});
