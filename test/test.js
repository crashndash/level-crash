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
