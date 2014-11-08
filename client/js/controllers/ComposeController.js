app.filter('add_search_entry', function () {
    // update placeholder entry with address if search string looks like a valid BM address
    // otherwise filters it out of result set.
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
        return _.filter(items, function (f) {
            return f.address;
        });
    }
});


app.controller('ComposeController', function (authentication, $q, $notify, $http, $location, $scope, $routeParams) {

    $scope.addressbook = [];
    $scope.identities = [];
    $scope.sending = false;
    $scope.data = {};

    var type = $routeParams.type;
    var id = $routeParams.id;

    var fetchPromises = [];
    fetchPromises.push($http.post('api/bm/addressbook/list', {token: authentication.getToken()}));
    fetchPromises.push($http.post('api/bm/addresses/list', {token: authentication.getToken(), enabledOnly: true}));
    if (type === 'reply') {
        fetchPromises.push($http.post('api/bm/messages/inbox/read', {
            token: authentication.getToken(),
            id: id,
            markRead: false
        }));
    }

    $q.all(fetchPromises).then(function (data) {

        // Pull active identities
        $scope.identities = data[1].data;

        // pull addressbook in sorted order.  Inject placeholder for address queries that
        // don't match an addressbook entry
        $scope.addressbook = [{search: true, label: 'Unknown'}].concat(data[0].data);

        // Lookup recipient address in addressbook.  Use ab entry if we have it and placeholder otherwise
        var lookupRecipient = function (id) {
            var address = _.findWhere($scope.addressbook, {address: id});
            if (!address) {
                address = _.findWhere($scope.identities, {address: id});
            }
            if (!address) {
                // unknown recipient, assign address to placeholder entry
                $scope.addressbook[0].address = id;
                address = $scope.addressbook[0];
            }
            return address;
        }

        // handle composeTo
        if (type === 'to') {
            $scope.data.toAddress = lookupRecipient(id);
        }

        // handle replyTo
        if (type === 'reply') {
            var replyData = data[2].data;
            $scope.data.toAddress = lookupRecipient(replyData.fromAddress);
            $scope.data.fromAddress = _.findWhere($scope.identities, {address: replyData.toAddress});
            $scope.data.subject = replyData.subject;
            $scope.data.message = '\n\n------------------------------------------------------\n' + replyData.message;
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
