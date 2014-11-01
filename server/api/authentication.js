var express = require('express');
var router = express.Router();
var session = require('../lib/session');

router.post('/login', function (req, res) {
    var username = (req.body.username || '').toLowerCase();
    var password = req.body.password;
    session.login(username, password).then(
        function (token) {
            res.json({status: true, token: token});
        },
        function (message) {
            res.json({status: false, message: message});
        });
});

router.post('/verify', function (req, res) {
    var token = req.body.token;
    session.verify(token).then(
        function () {
            res.json({status: true});
        },
        function (message) {
            res.json({status: false, message: message});
        });
});

module.exports = router;
