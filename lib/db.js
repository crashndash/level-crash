var util = require('util');
var app = require('../src/app');
var redis = require('redis');
var client;

var init = function(settings) {
  app.log(util.format('Connecting to redis server on %s:%s', settings.host, settings.port));
  client = redis.createClient(settings.port, settings.host);
};

var set = function(key, value, callback) {
  client.hset(app.namespace + '.levels', key, JSON.stringify(value), callback);
};

var get = function(key, callback) {
  client.hget(app.namespace + '.levels', key, function(err, res) {
    var val;
    try {
      var d = JSON.parse(res);
      val = d;
    }
    catch (e) {
      // Oh well.
      callback(e, val);
      return;
    }
    callback(err, val);
  });
};

var list = function(callback) {
  client.hgetall(app.namespace + '.levels', function(e, r) {
    if (e) {
      callback(e, r);
      return;
    }
    // Just get all keys. Unless there is none.
    if (!r) {
      callback(e, []);
      return;
    }
    // Sort keys.
    var keys = Object.keys(r);
    keys.sort();
    callback(e, keys);
  });
};

module.exports = {
  init: init,
  set: set,
  get: get,
  list: list
};
