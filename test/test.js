process.env.LEVEL_CRASHER_NS = 'levelcrash_test' + Math.random();
var app = require('../src/app');
var request = require('supertest');
var assert = require('assert');
var should = require('should');
const fs = require('fs')
const base64 = require('base-64')
const rimraf = require('rimraf')

app.config.port = 12345;
app.config.admin.user = 'admin';
app.config.admin.password = 'secret';
app.config.dataDir = 'testData/test' + Math.random();
app.start();

describe('App generally', function() {
  it('Should return 403 if user is banned', function(done) {
    app.banned['127.0.0.1'] = true;
    // ...and set ipv6 version as well.
    app.banned['::ffff:127.0.0.1'] = true;
    request(app)
    .get('/')
    .expect(403)
    .end(function(err, res) {
      app.banned = {};
      done(err);
    });
  });
  it('Should have a log function', function(done) {
    app.log.should.be.instanceOf(Function);
    // Try to invoke it in some ways.
    app.log('Cool, this is green');
    app.log('Cool, this is yellow', 'w');
    app.log('Cool, this is red', 'e');
    done();
  });
});

describe('Index.html', function() {
  it('Should return something on GET /', function(done) {
    request(app)
    .get('/')
    .end(function(err, res) {
      should(err).equal(null);
      res.status.should.equal(200);
      // Request it another time, so we can cover the cached case in the
      // codebase.
      request(app)
      .get('/')
      .end(function() {
        done();
      });
    });
  });
});

describe('/api paths', function() {
  var levelName = 'test' + Math.floor(Math.random() * 100);
  var levelAuthor = 'author' + Math.floor(Math.random() * 100);
  it('Should not return anything on /api/level', function(done) {
    request(app)
    .get('/api/level')
    .end(function(err, res) {
      res.status.should.equal(200);
      JSON.parse(res.text).length.should.equal(0);
      done(err);
    });
  });

  it('Should return 404 on non-existent level', function(done) {
    request(app)
    .get('/api/level/' + levelName)
    .expect(404)
    .end(function(err, res) {
      done(err);
    });
  });

  it('Should add level when sending POST to /api/level', function(done) {
    request(app)
    .post('/api/level')
    .send({
      name: levelName,
      level: {
        author: levelAuthor
      }
    })
    .end(function(err, res) {
      res.status.should.equal(200);
      done(err);
    });
  });

  it('Should add level when sending POST to /api/level even if it is empty', function(done) {
    request(app)
    .post('/api/level')
    .end(function (err, res) {
      res.status.should.equal(200);
      done(err);
    });
  });

  it('Should return 200 on existent level', function(done) {
    request(app)
    .get('/api/level/' + levelName)
    .end(function(err, res) {
      res.status.should.equal(200);
      JSON.parse(res.text).author.should.equal(levelAuthor);
      done(err);
    });
  });

  it('Should return 400 if user does not "own" the level', function(done) {
    // First, brute-force a level in there.
    var db = require('../lib/db');
    db.init(app.config.redis);
    var level = {
      name: 'testlevel',
      level: {
        ip: '12.34.56.78',
        name: 'testlevel'
      }
    };
    db.set(level.name, level.level, function(e) {
      // Try to post a level with the same name.
      request(app)
      .post('/api/level')
      .send({
        name: 'testlevel',
        level: {
        }
      })
      .expect(400)
      .end(function(err, res) {
        done(err);
      });

    });
  });

  it('Should return "my levels" when wanted', function(done) {
    request(app)
    .get('/api/mylevels')
    .end(function(err, res) {
      var ls = JSON.parse(res.text);
      ls.length.should.equal(2);
      ls.should.containEql(levelName);
      done(err);
    });
  });

  // And then the admin levels.
  it('Should return something on /admin', function(done) {
    request(app)
    .get('/admin')
    .set('Authorization', 'Basic YWRtaW46c2VjcmV0')
    .expect(200, done);
  });

  it('Should delete the level if we ask it to', function(done) {
    request(app)
    .delete('/admin/level/' + levelName)
    .set('Authorization', 'Basic YWRtaW46c2VjcmV0')
    .expect(204, done);
  });

  it('Should have problems responding when errors are occuring', function(done) {
    this.timeout(10000);
    // Provoke a couple of errors. For coverage of course.
    app.config.redis.port = 12345;
    app.config.port = 54321;
    app.start();
    request(app)
    .get('/api/level')
    .expect(500)
    .end(function() {
      // And then a couple of more.
      request(app)
      .post('/api/level')
      .expect(500, function() {
        request(app)
        .get('/api/level/bogus')
        .expect(500)
        .end(function() {
          request(app)
          .delete('/admin/level/bogus')
          .set('Authorization', 'Basic YWRtaW46c2VjcmV0')
          .expect(500)
          .end(function() {
            request(app)
            .get('/api/mylevels')
            .expect(500)
            .end(function() {
              app.config.redis.port = 6379;
              done();
            });
          });
        });
      });
    });
  });
});

describe('IP module', function() {
  app.config.port = 1234;
  app.start();
  var i = require('../lib/ip');

  it('Should return the expected value from a normal request', function() {
    var expected = 'test' + Math.floor(Math.random() * 1000);
    var ip = i({
      header: function() {
        return false;
      },
      connection: {
        remoteAddress: expected
      }
    });
    ip.should.equal(expected);
  });

  it('Should return the expected value from a forwarded request', function() {
    var expected = 'test' + Math.floor(Math.random() * 1000);
    var ip = i({
      header: function() {
        return expected;
      }
    });
    ip.should.equal(expected);
  });
});
describe('DB module', function() {
  var d = require('../lib/db');

  it('Should expose all excpected functions', function() {
    d.should.have.property('get');
    d.should.have.property('set');
    d.should.have.property('del');
    d.should.have.property('smembers');
    d.should.have.property('sadd');
    d.should.have.property('init');
    d.should.have.property('list');
  });

  it('Should get and set in an OK manner', function(done) {
    // Should probably init again, then?
    d.init(app.config)
    var testvalue = 'testvalue' + Math.floor(Math.random() * 1000);
    d.set('testkey', testvalue, function() {
      d.get('testkey', function(e, v) {
        v.should.equal(testvalue);
        done(e);
      });
    });
  });

  it('Should not set if we set an empty value', (done) => {
    var testkey = 'testkey123'
    d.set(testkey, '', () => {
      d.get(testkey, (err, res) => {
        should(res).equal(undefined)
        done(err, res)
      })
    })
  })

  it('Should fail if we delete the datadir and try to list files', (done) => {
    rimraf.sync(app.config.dataDir)
    d.smembers('1', (err, res) => {
      should(err).not.equal(undefined)
      d.init(app.config, done)
    })
  })

  it('Should fail json parsing if we save a bad file', (done) => {
    let testkey = 'testkey789'
    fs.writeFileSync(app.config.dataDir + '/' + base64.encode(testkey), 'badjson{}')
    d.get(testkey, (err, res) => {
      should(err).not.equal(undefined)
      done()
    })
  })

  it('Should delete a key as expected', function(done) {
    var testkey = 'testkey' + Math.floor(Math.random() * 1000);
    d.set(testkey, 'value', function(e, v) {
      d.get(testkey, function(f, w) {
        w.should.equal('value');
        d.del(testkey, function() {
          d.get(testkey, function(g, x) {
            should(x).equal(undefined);
            done(g);
          });
        });
      });
    });
  });

  it('Should do as expected when we try to list levels', function(done) {
    d.list(function(f, s) {
      s.length.should.not.equal(0);
      done(f);
    });
  });
});

describe('Auth module', function() {
  var a = require('../lib/auth');

  // Nicked this from the node-basic-auth tests.
  function request(authorization) {
    return {
      header: function(str) {
        if (str == 'x-forwarded-for') {
          return '231123.123';
        }
        return {
          authorization: authorization
        };
      },
      headers: {
        authorization: authorization
      }
    };
  }
  function response() {
    return {
      setHeader: function() {
      },
      writeHead: function() {
      },
      end: function() {}
    };
  }

  it('Should behave as expected', function(done) {
    a(request('Basic YWRtaW46c2VjcmV0'), response(), function() {
      done();
    });
  });

  it('Should ban a user after some time.', function(done) {
    var res = {
      send: function(code) {
        if (code === 403) {
          done();
        }
      },
      setHeader: function() {},
      writeHead: function() {},
      end: function() {}
    };
    a(request(), res);
    a(request(), res);
    a(request(), res);
    a(request(), res);
    a(request(), res);
    a(request(), res);
  });
});
