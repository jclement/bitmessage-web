var jwt = require('jwt-simple');
var _ = require('underscore');
var q = require('q');
var config = require('./config');

var buildToken = function (username) {
    return jwt.encode({
        username: username,
        timestamp: new Date()
    }, config('jwtSecret'));
};

var login = function (username, password) {
    var deferred = q.defer();
    if (!username) {
        deferred.reject('username is required');
        return deferred.promise;
    }
    if (!password) {
        deferred.reject('password is required');
        return deferred.promise;
    }
    if (username !== username.toLowerCase()) {
        deferred.reject('username must be lowercase');
        return deferred.promise;
    }
    var rec = _.findWhere(config('users'), {name: username});
    if (rec && rec.password === password) {
        deferred.resolve(buildToken(rec.username));
    } else {
        deferred.reject("invalid username or password");
    }
    return deferred.promise;
};

var verify = function (token) {
    var deferred = q.defer();
    try {
        var decoded = jwt.decode(token, config('jwtSecret'));
        deferred.resolve(decoded);
    } catch (err) {
        deferred.reject('invalid token');
    }
    return deferred.promise;
};

var enforce_valid_token = function (req, res, next) {
    var token = req.body.token;
    verify(token).then(
        function (data) {
            req.session = data;
            next();
        },
        function (err) {
            next(err);
        });
};

module.exports.login = login;
module.exports.enforce_valid_token = enforce_valid_token;
module.exports.verify = verify;
