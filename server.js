var express = require('express'), 
    http = require('http');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/dist'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// this rewrites all urls that aren't files (i.e. don't have a dot in them)
// to index.html to make deep linking work
app.get('^[^.]+$', function(req, res) {
  res.sendfile('dist/index.html');
});