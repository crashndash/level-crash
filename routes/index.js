var db = require('../lib/db');
var ip = require('../lib/ip');

var saveLevel = function(req, res) {
  var name = req.body.name;
  // First see if this name is taken.
  db.get(name, function(e, r) {
    if (e) {
      res.send(500);
      return;
    }
    var level = req.body.level || {};
    // Add IP address of user to the object.
    level.ip = ip(req);
    level.name = name;
    level.tagline = 'By ' + level.author;
    if (r && r.ip !== level.ip) {
      res.send(400, 'Name is taken. Sorry!');
      return;
    }
    db.set(name, level, function(e) {
      if (!e) {
        res.json(req.body.level);
        // Also add to ip list of levels

        // @todo, RLY? IP?
        db.sadd(level.ip, name);
        return;
      }
      res.send(500);
    });
  });
};

var listLevels = function(req, res) {
  // Find all level names.
  db.list(function(e, r) {
    if (e) {
      res.send(500);
      return;
    }
    if (!r) {
      res.send(404);
      return;
    }
    res.json(r);
  });
};

var getLevel = function(req, res) {
  // Find the level with this name (no ids here mister).
  db.get(req.params.name, function(e, r) {
    if (e) {
      res.send(500);
      return;
    }
    if (!r) {
      res.send(404);
      return;
    }
    res.json(r);
  });
};

var admin = function(req, res) {
  res.redirect('/');
};

var myLevels = function(req, res) {
  // Try to see what a list of levels this user owns.
  var userIp = ip(req);
  db.smembers(userIp, function(e, r) {
    if (e) {
      res.send(500);
      return;
    }
    res.json(r);
  });
};

module.exports = {
  saveLevel: saveLevel,
  listLevels: listLevels,
  getLevel: getLevel,
  admin: admin,
  myLevels: myLevels
};
