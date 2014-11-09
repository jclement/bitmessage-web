var debug = require('debug')('bitmessage-web');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var path = require('path');
var logger = require('morgan');
var fs = require('fs');
var _ = require('underscore');
var crypto = require('crypto');
var uuid = require('node-uuid');

var session = require('./lib/session');
var config = require('./lib/config');

var route_authentication = require('./api/authentication');
var route_bm = require('./api/bm');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, '..', 'client')));
app.use(logger('dev'));
app.use("/lib", express.static(path.join(__dirname, '..', 'bower_components')));
app.use("/fonts", express.static(path.join(__dirname, '..', 'bower_components', 'bootstrap', 'fonts')));
app.use('/api/auth', route_authentication);
app.use('/api/bm', route_bm);
app.use('/api/avatar', function (req, res) {
    // avatars are pulled from robohash.org
    // string passed to robohash is a random UUID and has no relation to the address being pulled.
    // the image is saved locally against the address to limit risks of robohash.org being monitored

    // filename for local cache is sha1 of path.  This eliminates need for special character testing.
    var sha = crypto.createHash('sha1');
    sha.update(req.path);
    var filename = sha.digest('hex') + '.png';

    // full path for image file
    var fullPath = path.join(__dirname, '..', 'cache', 'avatars', filename)

    fs.exists(fullPath, function (exists) {
        res.writeHead(200, {'Content-type': 'image/png'});
        if (exists) {
            // if image already exists, stream it
            fs.createReadStream(fullPath).pipe(res);
        } else {
            // generate UUID for robohash request, pull down image and save it
            var randomString = uuid.v4();
            var file = fs.createWriteStream(fullPath);
            http.get('http://robohash.org/' + randomString + '.png?size=24x24', function (imageResponse) {
                imageResponse.on('data', function (data) {
                    file.write(data);
                    res.write(data);
                }).on('end', function () {
                    file.end();
                    res.end();
                }).on('error', function(e) {
                    console.log(e);
                    file.end();
                    fs.unlink(filePath);
                });
            });
        }
    });
})
;

var port = config('port') || 3000;
http.createServer(app).listen(port, function () {
    debug('Started.  Listening on port ' + port);
});
