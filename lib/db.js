const util = require('util');
const asyncFilter = require('async/filter');
const mkdirp = require('mkdirp');
const fs = require('fs');
var app = require('../src/app');
var dataDir = 'data';

const createFilePath = (file) => {
  return util.format('./%s/%s', dataDir, file);
}

var init = function (settings, callback) {
  // Make a directory where specified.
  if (settings.dataDir) {
    dataDir = settings.dataDir;
  }
  mkdirp(dataDir, callback);
};

var set = function(key, value, callback) {
  if (!value) {
    // Just ignore that.
    return;
  }
  app.log(util.format('Saving level %s on behalf of ip %s', value.name, value.ip));
  client.hset(app.namespace + '.levels', key, JSON.stringify(value), callback);
};

const set_file = (key, value, callback) => {
  if (!value) {
    return;
  }
  fs.writeFile(createFilePath(key), JSON.stringify(value), callback);
}

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

const get_file = (key, callback) => {
  fs.readFile(createFilePath(key), (err, res) => {
    if (!res) {
      return callback(null, res);
    }
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
}

var del = function(key, callback) {
  client.hdel(app.namespace + '.levels',  key, callback);
};

const del_file = (key, callback) => {
  fs.unlink(createFilePath(key), callback);
}

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

const list_file = (callback) => {
  // @todo: Duplication.
  fs.readdir(createFilePath(''), (err, res) => {
    if (err) {
      return callback(err)
    }
    if (!res) {
      return callback(err, res);
    }
    // Add minimal info.
    var result = [];
    for (var i in res) {
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
    callback(err, result);
  });
}

var sadd = function(key, value, callback) {
  // No longer needed.
};

var smembers = function(key, callback) {
  client.smembers(app.namespace + '.' + key, callback);
};

const filterFiles = function(ip, key, callback) {
  // @todo: Cache. And rewrite when time.
  fs.readFile(createFilePath(key), (e, r) => {
    if (e) {
      callback(e)
    }
    else {
      try {
        var data = JSON.parse(r);
        callback(null, data.ip == ip);
      }
      catch (error) {
        callback(error)
      }
    }
  })
}

const smembers_file = function(key, callback) {
  fs.readdir(createFilePath(''), (err, res) => {
    if (err) {
      callback(err);
    }
    asyncFilter(res, filterFiles.bind(null, key), callback);
  });
}

module.exports = {
  init: init,
  set: set_file,
  get: get_file,
  del: del_file,
  list: list_file,
  sadd: sadd,
  smembers: smembers_file
};
