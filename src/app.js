// External modules.
var express = require('express');
var bodyParser = require('body-parser');
var yaml = require('js-yaml');
var fs = require('fs');
var util = require('util');
// Wooo. Colors.
require('colors');

// Internal modules.
var ip = require('../lib/ip');

// app.
var app = express();
app.banned = {};
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/* istanbul ignore next */
app.namespace = process.env.LEVEL_CRASHER_NS || 'levelcrasher';
module.exports = app;

// Redis db.
var db = require('../lib/db');

// Some routes.
var routes = require('../routes');

// @todo. Introduce more loggers.

// The following severities is available:
//   - i, w, e
app.log = function(str, severity) {
  var severityToColor = function(s, str) {
    if (s === 'w') {
      return str.yellow;
    }
    if (s === 'e') {
      return str.red;
    }
    return str.green;
  };
  if (!severity) {
    severity = 'info';
  }
  console.log(new Date().toString().yellow, severityToColor(severity, str));
};
app.use(function(req, res, next) {
  // First barrier. Ignore everyone on the ban list.
  var userIp = ip(req);
  if (app.banned[userIp]) {
    app.log(util.format('User is banned, and told so. User ip: %s', userIp));
    app.log('Current ban list:');
    app.log(userIp);
    res.status(403).end();
    return;
  }
  next();
});

// Read app config.
try {
  app.config = yaml.safeLoad(fs.readFileSync(__dirname + '/../config.yml', 'utf8'));
}
catch(err) {
  app.log('No config.yml file found. Using default.config.yml for now. This is most likely not what you want to do.', 'w');
  app.config = yaml.safeLoad(fs.readFileSync(__dirname + '/../default.config.yml', 'utf8'));
}
var auth = require('../lib/auth');
var textCached;
var indexHtml = function(req, res) {
  if (textCached) {
    res.send(textCached);
    return;
  }
  var filename = 'index.html';
  /* istanbul ignore next */
  if (process.env.NODE_ENV === 'production') {
    filename = 'index.prod.html';
  }
  fs.readFile(__dirname + '/../static/' + filename, 'utf8', function(err, text) {
    res.send(text);
    textCached = text;
  });
};

// API methods
app.get('/api/level', routes.listLevels);
app.get('/api/level/:name', routes.getLevel);
app.post('/api/level', routes.saveLevel);

// Index route, and angular paths.
app.get('/', indexHtml);
app.get('/level/:level', indexHtml);

// Used for getting the user's levels.
app.get('/api/mylevels', routes.myLevels);

// Admin path.
app.get('/admin', auth, routes.admin);
app.delete('/admin/level/:name', auth, routes.adminDelete);

app.use(express.static(__dirname + '/../static', {
  // Cache forever. Query parameter will change, so we don't care.
  maxAge: 3600000 * 24 * 30
}));

app.start = function() {
  // Boot up redis db client.
  db.init(app.config);

  // Listen on selected port
  app.listen(app.config.port);
  app.log(util.format('Listening on port %d', app.config.port));
};
