var debug = require('debug')('bitmessage-web');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var path = require('path');
var logger = require('morgan');
var fs = require('fs');
var _ = require('underscore');

var session = require('./lib/session');
var config = require('./lib/config');

var route_authentication = require('./api/authentication');
var route_test = require('./api/test');
var route_bm = require('./api/bm');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, '..', 'client')));
app.use(logger('dev'));
app.use("/lib", express.static(path.join(__dirname, '..', 'bower_components')));
app.use("/fonts", express.static(path.join(__dirname, '..', 'bower_components', 'bootstrap', 'fonts')));
app.use('/api/auth', route_authentication);
app.use('/api/test', route_test);
app.use('/api/bm', route_bm);

var port = config('port') || 3000;
http.createServer(app).listen(port, function () {
    debug('Started.  Listening on port ' + port);
});
