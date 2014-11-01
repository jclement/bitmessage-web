var app = angular.module('bitmessageApp', ['authentication','messages','ngRoute','ngNotify','LocalStorageModule']);

app.filter('trim', function() {
   return function(input) {
       return (input || '').trim();
   };
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

app.run(function($rootScope, authentication, $location, $route) {

    // placeholder for path to login page, discovered below when adding authResolver to routes
    var loginPage = null;

    var checkAccessToRoute = function(route) {
        // always allow access to login page
        if (route.loginPage) {
            return true;
        }
        // allow access to authenticated users or public pages
        return !!(authentication.isAuthenticated() || (route.public));

    };

    var authResolver = {
        auth: function($q, $timeout, authentication) {
            var deferred = $q.defer();
            authentication.init().then(function() {
                if (checkAccessToRoute($route.current)) {
                    // if user ends up linking to login page and they are authenticated, redirect them to default page
                    if (authentication.isAuthenticated() && $route.current.loginPage) {
                        $timeout(function() {
                            $location.path('/');
                        });
                    }
                    deferred.resolve();
                } else {
                    // permission denied (shouldn't really redirect here)
                    $timeout(function() {
                        $location.path(loginPage);
                    });
                    deferred.reject();
                }
            });
            return deferred;
        }
    };

    // decorate non-public routes with authentication verification
    for(var path in $route.routes) {
        var route = $route.routes[path];
        route.resolve = route.resolve || {};
        angular.extend(route.resolve, authResolver);
        if (route.loginPage) {
            loginPage = path;
        }
    }

});

app.controller('bitmessageController', function (authentication, messages, $scope) {

    $scope.isAuthenticated = function() {
        return authentication.isAuthenticated();
    };

    $scope.getUsername = function() {
        return authentication.getUsername();
    };

    $scope.unreadCount = messages.unreadCount;

    $scope.logout = function() {
        authentication.logout();
    };
});