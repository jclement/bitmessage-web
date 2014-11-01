var express = require('express');
var router = express.Router();
var session = require('../lib/session');
var logger = require('morgan');
var config = require('../lib/config');
var fs = require('fs');

var bm = require('bitmessage-node')(config('bm:host'), config('bm:port'), config('bm:username'), config('bm:password'));

// verify session on all garage API calls
router.use(session.enforce_valid_token);

router.post('/messages/inbox/list', function(req, res) {
   bm.messages.inbox.list(function(value) {
       res.json(value);
   })
});

router.post('/messages/inbox/delete', function(req, res) {
    bm.messages.inbox.moveToTrash(req.body.id, function(value) {
        console.dir(value);
        res.json(value);
    })
});

router.post('/addresses/list', function(req, res) {
    bm.addresses.list(function(value) {
        res.json(value);
    })
});

router.post('/addressbook/list', function(req, res) {
    bm.addressbook.list(function(value) {
        res.json(value);
    })
});

module.exports = router;
