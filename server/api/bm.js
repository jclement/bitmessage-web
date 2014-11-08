var express = require('express');
var router = express.Router();
var session = require('../lib/session');
var config = require('../lib/config');
var fs = require('fs');
var q = require('q');
var _ = require('underscore');

var bm = require('bitmessage-node')(config('bm:host'), config('bm:port'), config('bm:username'), config('bm:password'));

// verify session on all garage API calls
router.use(session.enforce_valid_token);

router.post('/messages/inbox/list', function (req, res) {

    var messagesDeferred = q.defer();
    bm.messages.inbox.list(function (value) {
        messagesDeferred.resolve(value);
    });

    var addressbookDeferred = q.defer();
    bm.addressbook.list(function (value) {
        addressbookDeferred.resolve(value);
    });

    var addressesDeferred = q.defer();
    bm.addresses.list(function (value) {
        addressesDeferred.resolve(value);
    });

    q.all([messagesDeferred.promise, addressbookDeferred.promise, addressesDeferred.promise])
        .then(function (data) {
            var messages = data[0];
            var addressbook = data[1];
            var addresses = data[2];
            var l = function(address) {
                var displayAddress = null;
                _.each(addresses, function(a) {
                    if (a.address === address) {
                        displayAddress = a.label;
                    }
                });
                if (!displayAddress) {
                    _.each(addressbook, function(a) {
                        if (a.address === address) {
                            displayAddress = a.label;
                        }
                    });
                }
                return displayAddress || address;
            };
            _.each(messages, function(message) {
                message.fromAddressDisplay = l(message.fromAddress);
                message.toAddressDisplay = l(message.toAddress);
            });
            res.json(messages);
        });
});

router.post('/messages/outbox/list', function (req, res) {

    var messagesDeferred = q.defer();
    bm.messages.sent.list(function (value) {
        messagesDeferred.resolve(value);
    });

    var addressbookDeferred = q.defer();
    bm.addressbook.list(function (value) {
        addressbookDeferred.resolve(value);
    });

    var addressesDeferred = q.defer();
    bm.addresses.list(function (value) {
        addressesDeferred.resolve(value);
    });

    q.all([messagesDeferred.promise, addressbookDeferred.promise, addressesDeferred.promise])
        .then(function (data) {
            var messages = data[0];
            var addressbook = data[1];
            var addresses = data[2];
            var l = function(address) {
                var displayAddress = null;
                _.each(addresses, function(a) {
                    if (a.address === address) {
                        displayAddress = a.label;
                    }
                });
                if (!displayAddress) {
                    _.each(addressbook, function(a) {
                        if (a.address === address) {
                            displayAddress = a.label;
                        }
                    });
                }
                return displayAddress || address;
            };
            res.json(_.chain(messages).filter(function(message) {
                return message.status !== 'ackreceived' &&
                    message.status !== 'msgsentnoackexpected';
            }).each(function(message) {
                message.fromAddressDisplay = l(message.fromAddress);
                message.toAddressDisplay = l(message.toAddress);
            }).value());

        });
});

router.post('/messages/inbox/delete', function (req, res) {
    bm.messages.inbox.moveToTrash(req.body.id, function (value) {
        res.json(value);
    });
});

router.post('/messages/inbox/read', function (req, res) {

    var messageDeferred = q.defer();
    bm.messages.inbox.single(req.body.id, function (value) {
        messageDeferred.resolve(value);
    }, req.body.markRead || true);

    var addressbookDeferred = q.defer();
    bm.addressbook.list(function (value) {
        addressbookDeferred.resolve(value);
    });

    var addressesDeferred = q.defer();
    bm.addresses.list(function (value) {
        addressesDeferred.resolve(value);
    });

    q.all([messageDeferred.promise, addressbookDeferred.promise, addressesDeferred.promise])
        .then(function (data) {
            var message = data[0];
            var addressbook = data[1];
            var addresses = data[2];
            var l = function(address) {
                var displayAddress = null;
                _.each(addresses, function(a) {
                    if (a.address === address) {
                        displayAddress = a.label;
                    }
                });
                if (!displayAddress) {
                    _.each(addressbook, function(a) {
                        if (a.address === address) {
                            displayAddress = a.label;
                        }
                    });
                }
                return displayAddress || address;
            };
            message.fromAddressDisplay = l(message.fromAddress);
            message.toAddressDisplay = l(message.toAddress);
            res.json(message);
        });
});

var sortAddresses = function(addresses) {
    return _.sortBy(addresses, function(a) {return a.label.toUpperCase();});
}

router.post('/addresses/list', function (req, res) {
    bm.addresses.list(function (value) {
        if (req.body.enabledOnly) {
            return res.json(sortAddresses(_.filter(value, function(a) {return a.enabled;})));
        }
        res.json(sortAddresses(value));
    });
});

router.post('/addressbook/list', function (req, res) {
    bm.addressbook.list(function (value) {
        res.json(sortAddresses(value));
    });
});

router.post('/addressbook/addEntry', function (req, res) {
    bm.addressbook.addEntry(req.body.address, req.body.label, function (message) {
        if (message.indexOf("Added address") === -1) {
            res.status(500);
            res.end(message);
        } else {
            res.json({
                address: req.body.address,
                label: req.body.label
            });
        }
    });
});

router.post('/addressbook/deleteEntry', function (req, res) {
    bm.addressbook.deleteEntry(req.body.address, function () {
        res.end();
    });
});


router.post('/addresses/createRandom', function(req, res) {
    bm.addresses.createRandom(req.body.label, function(id) {
        bm.addresses.list(function(addresses) {
           res.json(_.findWhere(addresses, {address: id}));
        });
    });
});

router.post('/messages/send', function(req, res) {
    bm.messages.send(req.body.toAddress, req.body.fromAddress, req.body.subject, req.body.message || '', function(data) {
        if (data.indexOf("API Error") !== -1) {
            res.status(500);
            res.end(data);
        } else {
            res.json(data);
        }
    })
});

module.exports = router;
