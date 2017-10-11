const util = require('util');
const asyncFilter = require('async/filter');
const mkdirp = require('mkdirp');
const fs = require('fs')
const base64 = require('base-64');
var app = require('../src/app');
var dataDir = 'data';

const createFilePath = (file) => {
  let fileName = '';
  if (file) {
    fileName = base64.encode(file)
  }
  return util.format('./%s/%s', dataDir, fileName)
}

var init = function (settings, callback) {
  // Make a directory where specified.
  if (settings.dataDir) {
    dataDir = settings.dataDir;
  }
  mkdirp(dataDir, callback);
};

const set_file = (key, value, callback) => {
  if (!value) {
    callback()
    return
  }
  fs.writeFile(createFilePath(key), JSON.stringify(value), callback);
}

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

const del_file = (key, callback) => {
  fs.unlink(createFilePath(key), callback);
}

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
    res.forEach((n) => {
      var l;
      try {
        let f = fs.readFileSync(dataDir + '/' + n)
        l = JSON.parse(f.toString());
      }
      catch (problem) {
        // Make a bogus level object.
        l = {author: "", timestamp: 0};
      }
      result.push({
        title: base64.decode(n),
        author: l.author,
        timestamp: l.timestamp
      })
    })
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
      callback(err)
      return
    }
    let r = []
    res.forEach((n) => {
      r.push(base64.decode(n))
    })
    asyncFilter(r, filterFiles.bind(null, key), callback)
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
