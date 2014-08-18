/*global c, chai, describe, it */

var assert = chai.assert;

describe('mainCtrl', function() {
  var createController, mockScope, mockHttp, lastalert, mockLocation;

  beforeEach(module('levelCrash.controllers'));
  beforeEach(module('levelCrash.directives'));
  beforeEach(inject(function($controller, $rootScope, $httpBackend, $location) {
    mockHttp = $httpBackend;
    mockScope = $rootScope;
    mockLocation = $location;
    var mockWindow = {
      alert: function(msg) {
        console.log(msg);
        lastalert = msg;
      }
    };
    createController = function() {
      return $controller('mainCtrl', {
        '$scope': $rootScope,
        '$window': mockWindow
      });
    };
  }));

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

  it('Should react as expected when we try to continue to editor', function() {
    var testName = 'testName' + Math.floor(Math.random() * 100);
    createController();
    mockScope.tryStepTwo();
    assert.equal(lastalert, 'Please choose a level name between 1 and 12 characters.');
    mockScope.name = '';
    mockScope.tryStepTwo();
    assert.equal(lastalert, 'Please choose a level name between 1 and 12 characters.');
    mockScope.name = '1234567890123';
    mockScope.tryStepTwo();
    assert.equal(lastalert, 'Please choose a level name between 1 and 12 characters.');
    mockScope.name = testName;
    mockScope.tryStepTwo();
    assert.equal(lastalert, 'Please use a name between 1 and 12 characters.');
    mockScope.author = '';
    mockScope.tryStepTwo();
    assert.equal(lastalert, 'Please use a name between 1 and 12 characters.');
    mockScope.author = '1234567890123';
    mockScope.tryStepTwo();
    assert.equal(lastalert, 'Please use a name between 1 and 12 characters.');
    mockScope.author = testName;
    mockScope.tryStepTwo();
    mockHttp.expectGET('/api/mylevels', undefined).respond(200, '');
    mockHttp.expectPOST('/api/level', undefined).respond(200, '');
    mockHttp.flush();
    assert.equal(mockLocation.path(), '/level/' + testName);

    // Do some error checking as well.
    createController();
    mockScope.tryStepTwo();
    mockHttp.expectGET('/api/mylevels', undefined).respond(200, '');
    mockHttp.expectPOST('/api/level', undefined).respond(400, '');
    mockHttp.flush();
    assert.equal(lastalert, 'Something went wrong!');
  });

  it('Should escape some ugly paths', function() {
    createController();
    assert.equal(mockScope.makePath('test/test2.$##'), 'test%252Ftest2.%2524%2523%2523');
    assert.equal(mockScope.makePath('test123'), 'test123');
  });
});

describe('levelCtrl', function() {
  var createController, mockScope, mockHttp, mockLocation, level, lastalert;

  var levelName = 'testlevel' + Math.floor(Math.random() * 1000);

  beforeEach(module('levelCrash.controllers'));
  beforeEach(module('levelCrash.directives'));
  beforeEach(inject(function($controller, $rootScope, $httpBackend, $location) {
    mockHttp = $httpBackend;
    mockHttp.when('GET', '/api/level/' + levelName).respond(200, {});
    mockScope = $rootScope;
    mockLocation = $location;
    var mockWindow = {
      alert: function(msg) {
        console.log(msg);
        lastalert = msg;
      }
    };
    createController = function() {
      return $controller('levelCtrl', {
        '$scope': $rootScope,
        '$window': mockWindow,
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

  it('Should not redirect to start if we are getting other errors', function() {
    mockHttp.expectGET('/api/level/' + levelName, undefined).respond(403);
    createController();
    mockHttp.flush();
    assert.notEqual(mockLocation.path(), '/');
  });

  it('Should return the expected value from makeRoads', function() {
    createController();
    var r = mockScope.makeRoads();
    assert.equal(r.length, mockScope.level.length);
    r = mockScope.makeRoads();
    assert.equal(r.length, mockScope.level.length);
    mockScope.level.length = Math.floor(Math.random() * 10) + 70;
    assert.notEqual(r.length, mockScope.level.length);
  });

  it('Should return the expected value from hasPowerup() and powerUp()', function() {
    createController();
    assert.equal(false, mockScope.hasPowerup(2));
    mockScope.level.powerups[48] = 'bomb';
    assert.equal(true, mockScope.hasPowerup(2));
    assert.equal('bomb', mockScope.powerUp(2));
    assert.equal(false, mockScope.powerUp(3));
  });

  it('Should return the expected value from hasSwarm()', function() {
    createController();
    assert.equal(false, mockScope.hasSwarm(2));
    mockScope.level.swarms[48] = true;
    assert.equal(true, mockScope.hasSwarm(2));
  });

  it('Should return the expected value from hasObstacle() and obstacle()', function() {
    createController();
    assert.equal(false, mockScope.hasObstacle(2));
    mockScope.level.obstacles[48] = 'wheel';
    assert.equal(true, mockScope.hasObstacle(2));
    assert.equal('wheel', mockScope.obstacle(2));
    assert.equal(false, mockScope.obstacle(3));
  });

  it('Should return the expected value from hasBlock() and block()', function() {
    createController();
    assert.equal(false, mockScope.hasBlock(2));
    mockScope.level.blocks[48] = 'bricks';
    assert.equal(true, mockScope.hasBlock(2));
    assert.equal('bricks', mockScope.block(2));
    assert.equal(false, mockScope.block(3));
  });

  it('Should return the expected value from getWidth()', function() {
    createController();
    assert.equal(mockScope.level.minOffset, mockScope.getWidth(0, 1));
    // Mocking away.
    var ev = {
      target: '<div data-index="1" data-side="0"></div>'
    };
    mockScope.sideResized(ev, {
      size: {
        width: 10
      }
    });
    assert.equal(10, mockScope.getWidth(0, 1));
  });

  it('Should return the expected values from getSvgPoints()', function() {
    createController();
    var segment = Math.floor(Math.random() * 10) + 10;
    assert.equal(mockScope.getSvgPoints(1, segment), '50,0 80,0 80,100 50,100');
    // Resize and check again.
    var ev = {
      target: '<div data-index="' + segment + '" data-side="1"></div>'
    };
    mockScope.sideResized(ev, {
      size: {
        width: 10
      }
    });
    assert.equal(mockScope.getSvgPoints(1, segment), '50,0 80,0 80,100 70,100');
  });

  it('Should return the expected value from getHeight()', function() {
    createController();
    var segment = Math.floor(Math.random() * 10) + 20;
    assert.equal(mockScope.getHeight(segment), 100);
    mockScope.level.roadAlters[(mockScope.level.length) - segment] = 90;
    assert.equal(mockScope.getHeight(segment), 90);
  });

  it('Should do something expepted when we try to save the level', function() {
    createController();
    mockScope.saveLevel();
    assert.equal(lastalert, 'Something went wrong');
    // Create a name for the level, try again.
    mockScope.level.name = levelName;
    mockScope.saveLevel();
    mockHttp.expectPOST('/api/level', undefined).respond(200, '');
    mockHttp.flush();

    // Test problem posting
    mockHttp.expectPOST('/api/level', undefined).respond(400, 'Name is taken');
    mockScope.saveLevel();
    mockHttp.flush();
    assert.equal(lastalert, 'Name is taken');

    mockHttp.expectPOST('/api/level', undefined).respond(418);
    mockScope.saveLevel();
    mockHttp.flush();
    assert.equal(lastalert, 'We had some problems saving this.');
  });

  it('Should do what is expected with addElement()', function() {
    var segment = Math.floor(Math.random() * 10) + 30;
    createController();
    // Just do this so we can increase coverage. :)
    mockScope.addElement();
    mockScope.setElementActive();
    mockScope.addElement(segment);

    // See that the expected things actually happens
    mockScope.setElementActive('block', 'bricks');
    mockScope.addElement(segment);
    assert.equal(mockScope.level.blocks[(mockScope.level.length - segment)], 'bricks');
    mockScope.addElement(segment);
    assert.equal(mockScope.level.blocks[(mockScope.level.length - segment)], undefined);
  });

  it('Should return expected value from isElementActive()', function() {
    createController();
    assert.equal(mockScope.isElementActive('block', 'bricks'), true);
    assert.equal(mockScope.isElementActive('block', 'water'), false);
    mockScope.setElementActive('block', 'water');
    assert.equal(mockScope.isElementActive('block', 'water'), true);
  });

  it('Should do as expected when using arrows to resize', function() {
    createController();
    // Make sure we are working with empty offsets from the start.
    assert.equal(mockScope.level.offsets[1], undefined);
    assert.equal(mockScope.level.length, 50);
    // Try to manipulate the offsets.
    mockScope.adjustSide(49, 1, 5);
    assert.notEqual(mockScope.level.offsets[1], undefined);
    assert.equal(mockScope.level.offsets[1][1], 65);

    // Do it again, just to be sure.
    mockScope.adjustSide(49, 1, 5);
    assert.notEqual(mockScope.level.offsets[1], undefined);
    assert.equal(mockScope.level.offsets[1][1], 70);

    // And then something outrageous
    var test = mockScope.adjustSide(49, 1, 500);
    assert.equal(test, false);
    // And it should not have effect.
    assert.equal(mockScope.level.offsets[1][1], 70);
  });
});
