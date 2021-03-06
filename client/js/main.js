var app = angular.module('bitmessageApp', ['ngSanitize', 'authentication', 'ngRoute', 'ngNotify', 'LocalStorageModule', 'cfp.hotkeys', 'ui.select']);

app.filter('trim', function () {
    return function (input) {
        return (input || '').trim();
    };
});

app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    }
});

app.config(function ($routeProvider) {
    $routeProvider.when('/login', {
        controller: 'LoginController',
        templateUrl: 'partials/login.html',
        loginPage: true  // login page is special, un-authorized users are redirected here when accessing secure pages
    });
    $routeProvider.when('/about', {
        controller: 'AboutController',
        templateUrl: 'partials/about.html',
        public: true // pages are secure by default.  public pages can be tagged in this way.
    });
    $routeProvider.when('/outbox', {
        controller: 'OutboxController',
        templateUrl: 'partials/outbox.html'
    });
    $routeProvider.when('/compose', {
        controller: 'ComposeController',
        templateUrl: 'partials/compose.html'
    });
    $routeProvider.when('/compose/:type/:id', {
        controller: 'ComposeController',
        templateUrl: 'partials/compose.html'
    });
    $routeProvider.when('/view/:msgid', {
        controller: 'ViewController',
        templateUrl: 'partials/view.html'
    });
    $routeProvider.when('/inbox', {
        controller: 'InboxController',
        templateUrl: 'partials/inbox.html'
    });
    $routeProvider.when('/addressBook', {
        controller: 'AddressBookController',
        templateUrl: 'partials/addressbook.html'
    });
    $routeProvider.when('/identities', {
        controller: 'IdentitiesController',
        templateUrl: 'partials/identities.html'
    });
    $routeProvider.otherwise({redirectTo: "/inbox"});

});

app.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix("bm");
}]);

app.run(function ($rootScope, authentication, $location, $route) {

    // placeholder for path to login page, discovered below when adding authResolver to routes
    var loginPage = null;

    var checkAccessToRoute = function (route) {
        // always allow access to login page
        if (route.loginPage) {
            return true;
        }
        // allow access to authenticated users or public pages
        return !!(authentication.isAuthenticated() || (route.public));

    };

    var authResolver = {
        auth: function ($q, $timeout, authentication) {
            var deferred = $q.defer();
            authentication.init().then(function () {
                if (checkAccessToRoute($route.current)) {
                    // if user ends up linking to login page and they are authenticated, redirect them to default page
                    if (authentication.isAuthenticated() && $route.current.loginPage) {
                        $timeout(function () {
                            $location.path('#/index');
                        });
                    }
                    deferred.resolve();
                } else {
                    // permission denied (shouldn't really redirect here)
                    $timeout(function () {
                        $location.path(loginPage);
                    });
                    deferred.reject();
                }
            });
            return deferred;
        }
    };

    // decorate non-public routes with authentication verification
    for (var path in $route.routes) {
        var route = $route.routes[path];
        route.resolve = route.resolve || {};
        angular.extend(route.resolve, authResolver);
        if (route.loginPage) {
            loginPage = path;
        }
    }

});

app.controller('bitmessageController', function (authentication, $q, $location, $http, $interval, $scope, hotkeys) {

    $scope.messages = [];

    hotkeys.bindTo($scope)
        .add({
            combo: 'n',
            description: 'New Message',
            callback: function () {
                $location.path("compose");
            }
        })
        .add({
            combo: 'a',
            description: 'Address Book',
            callback: function () {
                $location.path("addressBook");
            }
        })
        .add({
            combo: 'i',
            description: 'Inbox',
            callback: function () {
                $location.path("inbox");
            }
        });

    var refresh = function () {
        var deferred = $q.defer();
        if (authentication.isAuthenticated()) {
            $http.post('api/bm/messages/inbox/list', {token: authentication.getToken()})
                .success(function (data) {
                    _.each(data, function (message) {
                        message.receivedTime = Date.parse(message.receivedTime);
                    });
                    $scope.messages = data;
                    deferred.resolve();
                });
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    };

    authentication.onStateChange(refresh);
    $interval(refresh, 5000);

    $scope.isAuthenticated = function () {
        return authentication.isAuthenticated();
    };

    $scope.getUsername = function () {
        return authentication.getUsername();
    };

    $scope.unreadCount = function () {
        return _.filter($scope.messages, function (m) {
            return m.read === 0;
        }).length;
    };

    $scope.logout = function () {
        authentication.logout();
    };

});