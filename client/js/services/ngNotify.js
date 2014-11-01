angular.module('ngNotify', []).factory('$notify', function () {
    return {
        info: function (message) {
            noty({text: message, timeout: 5000, type: 'info', layout: 'bottom'});

        },
        success: function (message) {
            noty({text: message, timeout: 5000, type: 'success', layout: 'bottom'});

        },
        warning: function (message) {
            noty({text: message, timeout: 5000, type: 'warning', layout: 'bottom'});

        },
        error: function (message) {
            noty({text: message, type: 'error', layout: 'bottom'});
        }
    };
});