/*global c, chai, describe, it */

var assert = chai.assert;

describe('mainCtrl', function() {
  var createController, mockScope, mockHttp;

  beforeEach(module('levelCrash.controllers'));
  beforeEach(module('levelCrash.directives'));
  beforeEach(inject(function($controller, $rootScope, $httpBackend) {
    mockHttp = $httpBackend;
    mockScope = $rootScope;
    createController = function() {
      return $controller('mainCtrl', {
        '$scope': $rootScope
      });
    };
  }));

  it('Should pass when creating the controller', function() {
    createController();
    assert.equal(mockScope.errors.length, 0);
  });

  it('Should display "my levels" when given a response', function() {
    var myLevels = [
      'testlevel'
    ];
    mockHttp.expectGET('/api/mylevels', undefined).respond(200, myLevels);
    createController();
    mockHttp.flush();
    assert.equal(mockScope.myLevels.length, myLevels.length);
    assert.equal(mockScope.myLevels[0], myLevels[0]);
  });
});

describe('levelCtrl', function() {
  var createController, mockScope, mockHttp, mockLocation, level;

  var levelName = 'testlevel' + Math.floor(Math.random() * 1000);

  beforeEach(module('levelCrash.controllers'));
  beforeEach(module('levelCrash.directives'));
  beforeEach(inject(function($controller, $rootScope, $httpBackend, $location) {
    mockHttp = $httpBackend;
    mockScope = $rootScope;
    mockLocation = $location;
    createController = function() {
      return $controller('levelCtrl', {
        '$scope': $rootScope,
        '$routeParams': {
          level: levelName
        }
      });
    };
  }));

  it('Should not throw an error when being created', function() {
    createController();
    assert.equal(true, true);
    // Save a default level for later.
    level = mockScope.level;
    // Make it have a length between 120 and 130.
    level.length = Math.floor(Math.random() * 10) + 120;
  });

  it('Should try to load a level based on route params', function() {
    mockHttp.expectGET('/api/level/' + levelName, undefined).respond(200, level);
    createController();
    mockHttp.flush();
    assert.equal(mockScope.level.length, level.length);
  });

  it('Should redirect to start if we are getting 404', function() {
    mockHttp.expectGET('/api/level/' + levelName, undefined).respond(404);
    createController();
    mockHttp.flush();
    assert.equal(mockLocation.path(), '/');
  });
});
