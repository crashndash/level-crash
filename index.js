// Load app.
var app = require('./src/app');
var util = require('util');

// Listen on selected port
app.listen(app.config.port);
app.log(util.format('Listening on port %d', app.config.port));
