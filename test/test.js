process.env.LEVEL_CRASHER_NS = 'levelcrash_test' + Math.random();
var app = require('../src/app');
var request = require('supertest');
var assert = require('assert');
var should = require('should');

app.config.port = 12345;
app.start();

describe('Index.html', function() {
  it('Should return something on GET /', function(done) {
    request(app)
    .get('/')
    .end(function(err, res) {
      should(err).equal(null);
      res.status.should.equal(200);
      done();
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
    .end(function(err, res) {
      res.status.should.equal(404);
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
      .end(function(err, res) {
        res.status.should.equal(400);
        done(err);
      });

    });
  });
});
