var express = require('express');
var app = express();
var yaml = require('js-yaml');
var fs = require('fs');
// Wooo. Colors.
var colors = require('colors');

app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);

// @todo. Introduce more loggers.

// The following severities is available:
//   - i, w, e
app.log = function(str, severity) {
  var severityToColor = function(s, str) {
    switch(s) {
      case 'w':
        return str.yellow;

      case 'e':
        return str.red;

      case 'i':
      default:
        return str.green;
    }
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

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
    res.send(text);
  });
});
module.exports = app;
