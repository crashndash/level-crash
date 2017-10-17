// Load app.
var app = require('./src/app');

// Start server.
app.start();

// Start kill-switch.
const ks = require('kill-switch')
ks.autoStart()
