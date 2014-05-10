var util = require('util');
var app = require('../src/app');
var redis = require('redis');
var client;

var init = function(settings, callback) {
  app.log(util.format('Connecting to redis server on %s:%s', settings.host, settings.port));
  client = redis.createClient(settings.port, settings.host);
  client.on('error', function(err) {
    if (callback) {
      callback(err);
    }
  });
};

var set = function(key, value, callback) {
  if (!value) {
    // Just ignore that.
    return;
  }
  app.log(util.format('Saving level %s on behalf of ip %s', value.name, value.ip));
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

var del = function(key, callback) {
  client.hdel(app.namespace + '.levels',  key, callback);
};

var list = function(callback) {
  client.hgetall(app.namespace + '.levels', function(e, r) {
    /* istanbul ignore next */
    if (e) {
      callback(e, r);
      return;
    }
    // Just get all keys. Unless there is none.
    if (!r) {
      callback(e, []);
      return;
    }
    // Add minimal info.
    var result = [];
    for (var i in r) {
      var l;
      try {
        l = JSON.parse(r[i]);
      }
      catch (problem) {
        // Make a bogus level object.
        l = {author: "", timestamp: 0};
      }
      result.push({
        title: i,
        author: l.author,
        timestamp: l.timestamp
      });
    }
    result.sort(function(a, b) {
      var textA = a.title.toUpperCase();
      var textB = b.title.toUpperCase();
      /* istanbul ignore next */
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    callback(e, result);
  });
};

var sadd = function(key, value, callback) {
  client.sadd(app.namespace + '.' + key, value, callback);
};

var smembers = function(key, callback) {
  client.smembers(app.namespace + '.' + key, callback);
};

module.exports = {
  init: init,
  set: set,
  get: get,
  del: del,
  list: list,
  sadd: sadd,
  smembers: smembers
};
