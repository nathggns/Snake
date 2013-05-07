var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');

require('./pid').create();

var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);

// all environments
app.configure('development', function() {
    app.use(express.errorHandler());
     app.use(express.logger('dev'));
    io.set('log level', 3);
});

app.configure('production', function() {
    io.set('log level', 0);
});

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.set('view options', { layout: false });
    app.engine('html', function(path, options, fn) {
        try {
            var str = fs.readFileSync(path, 'utf8');

            fn(null, str);
        } catch (err) {
            fn(err);
        }
    });
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('node-compass')());
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', routes.index);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
