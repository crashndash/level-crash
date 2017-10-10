var fs = require('fs');

var db = require('../lib/db');
var ip = require('../lib/ip');

var saveLevel = function (req, res) {
  var name = req.body.name
  if (!name) {
    // Just find a name i guess.
    name = Math.random()
  }
  // First see if this name is taken.
  db.get(name, function (e, r) {
    if (e) {
      res.send(500).end()
      return
    }
    var level = req.body.level || {};
    // Add IP address of user to the object.
    level.ip = ip(req);
    level.name = name;
    level.tagline = 'By ' + level.author;
    level.timestamp = Date.now();
    if (r && r.ip !== level.ip) {
      res.status(400, 'Name is taken. Sorry!').end();
      return
    }
    db.set(name, level, function (e) {
      // No idea how I would go on and mock this...
      /* istanbul ignore else */
      if (!e) {
        res.json(level);
        // Also add to ip list of levels

        // @todo, RLY? IP?
        db.sadd(level.ip, name);
        return;
      }
      else {
        res.sendStatus(500);
      }
    });
  });
};

var listLevels = function(req, res) {
  // Find all level names.
  db.list(function(e, r) {
    if (e) {
      res.status(500).end();
      return;
    }
    // Not sure if this is even possible...

    /* istanbul ignore if */
    if (!r) {
      res.status(404).end();
      return;
    }
    res.json(r);
  });
};

var getLevel = function(req, res) {
  // Find the level with this name (no ids here mister).
  db.get(req.params.name, function(e, r) {
    if (e) {
      res.status(500).end();
      return;
    }
    if (!r) {
      res.status(404).end();
      return;
    }
    res.json(r);
  });
};

var admin = function(req, res) {
  fs.readFile(__dirname + '/../static/admin.html', 'utf8', function(err, text) {
    res.send(text);
  });
};

var adminDelete = function(req, res) {
  // Find name to delete.
  var level = req.params.name;
  db.del(level, function(e, r) {
    if (e) {
      res.status(500, e).end();
    }
    res.status(204).end();
  });
};

var myLevels = function(req, res) {
  // Try to see what a list of levels this user owns.
  var userIp = ip(req);
  db.smembers(userIp, function(e, r) {
    if (e) {
      res.status(500).end();
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
  adminDelete: adminDelete,
  myLevels: myLevels
};
