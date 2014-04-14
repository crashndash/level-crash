var express = require('express');
var app = express();
app.namespace = 'levelcrasher';
module.exports = app;
var yaml = require('js-yaml');
var fs = require('fs');
var util = require('util');
// Wooo. Colors.
require('colors');

// Redis db.
var db = require('../lib/db');

// Some routes.
var routes = require('../routes');

app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);

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

// Read app config.
try {
  app.config = yaml.safeLoad(fs.readFileSync('../config.yml', 'utf8'));
}
catch(err) {
  app.log('No config.yml file found. Using default.config.yml for now. This is most likely not what you want to do.', 'w');
  app.config = yaml.safeLoad(fs.readFileSync('./default.config.yml', 'utf8'));
}

app.use(express.static(__dirname + '/../static'));

app.get('/', function(req, res){
  fs.readFile(__dirname + '/../static/index.html', 'utf8', function(err, text){
    res.send(text);
  });
});
app.get('/api/level', routes.listLevels);
app.get('/api/level/:name', routes.getLevel);
app.post('/api/level', routes.saveLevel);
app.start = function() {
  // Boot up redis db client.
  db.init(app.config.redis);

  // Listen on selected port
  app.listen(app.config.port);
  app.log(util.format('Listening on port %d', app.config.port));
};
