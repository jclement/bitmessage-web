app.filter('add_search_entry', function () {
    return function (items, search) {
        if (search) {
            if (items.length > 0 && items[0].search) {
                if (!search.match(/^BM-(?:(?![IlO0])[A-Za-z0-9]){32,34}$/)) {
                    items[0].address = null;
                } else {
                    if (items[0].address !== search) {
                        items[0].address = search;
                    }
                }
            }
        }
        return _.filter(items, function(f) {return f.address;});
    }
});


app.controller('ComposeController', function (authentication, $notify, $http, $location, $scope, $routeParams) {

    $scope.addressbook = [];
    $scope.identities = [];
    $scope.sending = false;
    $scope.data = {};

    var type = $routeParams.type;
    var id = $routeParams.id;

    if (type === 'to') {
        $scope.data.toAddress = {'label': id, 'address': id};
    }

    if (type === 'reply') {
        $http.post('api/bm/messages/inbox/read', {
            token: authentication.getToken(),
            id: id,
            markRead: false
        })
            .success(function (data) {
                $scope.data.toAddress = {'label': data.fromAddress, 'address': data.fromAddress};
                $scope.data.fromAddress = {'label': data.toAddress, 'address': data.toAddress};
                $scope.data.subject = data.subject;
                $scope.data.message = '\n\n------------------------------------------------------\n' + data.message;
            });
    }

    $http.post('api/bm/addressbook/list', {token: authentication.getToken()})
        .success(function (data) {
            $scope.addressbook = [{search: true, label: 'Unknown'}].concat(data);

            if ($scope.data.toAddress) {
                // after loading identities, see if we have a from address and rewrite the label if we do
                var found = false;
                _.each($scope.addressbook, function (i) {
                    if (i.address === $scope.data.toAddress.address) {
                        $scope.data.toAddress = i;
                        found = true;
                    }
                });
                if (!found) {
                    $scope.addressbook[0].address = $scope.data.toAddress.address;
                    $scope.data.toAddress = $scope.addressbook[0];
                }
            }

        });

    $http.post('api/bm/addresses/list', {token: authentication.getToken()})
        .success(function (data) {
            $scope.identities = _.chain(data).filter(function (i) {
                return i.enabled;
            }).sortBy(function (i) {
                return i.label.toUpperCase();
            }).value();

            if ($scope.data.fromAddress) {
                // after loading identities, see if we have a from address and rewrite the label if we do
                _.each($scope.identities, function (i) {
                    if (i.address === $scope.data.fromAddress.address) {
                        $scope.data.fromAddress = i;
                    }
                })
            }
        });

    $scope.send = function () {
        $http.post('api/bm/messages/send', {
            token: authentication.getToken(),
            toAddress: $scope.data.toAddress.address,
            fromAddress: $scope.data.fromAddress.address,
            subject: $scope.data.subject,
            message: $scope.data.message
        })
            .success(function (ack) {
                $location.path("#/inbox");
                $notify.success("Message queued for delivery (" + ack + ").");
            })
            .error(function (message) {
                $notify.error(message);
            });

    };
});
