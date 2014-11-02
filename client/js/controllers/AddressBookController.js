app.controller('AddressBookController', function (authentication, $notify, $http, $location, $scope) {

    $scope.addressbook = [];

    $http.post('api/bm/addressbook/list', {token: authentication.getToken()})
        .success(function (data) {
            $scope.addressbook = data;
        });

    $scope.newEntry = function (label, address) {
        $http.post('api/bm/addressbook/addEntry', {token: authentication.getToken(), address:address, label: label})
            .success(function (data) {
                $scope.addressbook.push(data);
                $scope.newForm.label = null;
                $scope.newForm.address = null;
            })
            .error(function(message) {
                $notify.error(message);
            });
    };

    $scope.deleteEntry = function (entry) {
        $http.post('api/bm/addressbook/deleteEntry', {token: authentication.getToken(), address: entry.address})
            .success(function () {
                $scope.addressbook = _.without($scope.addressbook, entry);
            });
    };

});
