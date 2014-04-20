/*global c, chai, describe, it */

var assert = chai.assert;

describe('App functionality', function() {
  var createController;

  beforeEach(module('levelCrash.controllers'));
  beforeEach(inject(function($controller, $rootScope, $location, $http) {
    mockScope = $rootScope;
    createController = function() {
      return $controller('mainCtrl', {
        '$scope': $rootScope,
        '$location': $location,
        '$http': $http
      });
    };
  }));

  it('Should just pass', function() {
    createController();
    assert.equal(mockScope.errors, []);
  });
});
