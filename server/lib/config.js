var nconf = require('nconf');
var crypto = require('crypto');
var path = require('path');
nconf.argv().env().file({file: path.join(__dirname, '..', '..', 'config.json')});

if (!nconf.get('jwtSecret')) {
    // if we don't have a JWT secret in configuration, generate one on startup
    // this means sessions don't survive restarts but should also be a good
    // safe default
    crypto.randomBytes(20, function (ex, buf) {
        nconf.set('jwtSecret', buf.toString('hex'));
    });
}
module.exports = function (k) {
    return nconf.get(k);
};
