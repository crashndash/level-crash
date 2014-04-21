var auth = require('http-auth');
var util = require('util');
var app = require('../src/app');
var ip = require('./ip');

var loginAttempts= {};

var authCallback = function(user, pass, callback) {
  callback(user === app.config.admin.user && pass === app.config.admin.password);
};

var basic = auth.basic({
  realm: "Admin area"
  },
  authCallback
);

module.exports = function(req, res, next) {
  var userIp = ip(req);
  loginAttempts[userIp] = loginAttempts[userIp] || 0;
  loginAttempts[userIp]++;
  if (loginAttempts[userIp] > 5) {
    // Ban user for the lifetime of this node process.
    app.log(util.format('Banning user with ip %s after more than 5 login attempts', userIp));
    app.banned[userIp] = true;
    return res.send(403);
  }
  return basic.check(req, res, function() {
    // If this went OK, we decrease loginAttempts for this person.
    loginAttempts[userIp]--;
    return next();
  });
};
