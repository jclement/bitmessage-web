var express = require('express');
var router = express.Router();
var session = require('../lib/session');
var logger = require('morgan');
var config = require('../lib/config');
var fs = require('fs');

// verify session on all garage API calls
router.use(session.enforce_valid_token);

router.post('/status', function (req, res) {
            res.json({'status':'ok'});
});

router.post('/do', function (req, res) {
    res.end('');
});

router.post('/close', function (req, res) {
    garage.close();
    res.end('');
});

module.exports = router;
