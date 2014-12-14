;(function(angular) {
  'use strict';
  angular.module('levelCrash.controllers')
  .controller('levelCtrl', ['$scope', '$timeout', '$http', '$routeParams', '$location', '$window', function ($scope, $timeout, $http, $routeParams, $location, $window) {
    var roads = [];
    var lastlevelLength;
    var activeElement;
    var level = {
      "obstacles": {},
      //"jumpDuration": 1.5,
      //"powerFreq": 0,
      //"obstacleFreq": 0,
      "jumpCount": 11,
      "minOffset": 30,
      "maxOffset": 30,
      "powerups": {},
      //"speedFactor": 1,
      //"availableObstacles": ["wheel"],
      //"carWeight": 10,
      "blocks": {},
      //"spawnFrequency": 100,
      "offsets": {},
      //"enemyLimit": 5,
      //"impulsefactor": 80,
      "theme": "grass",
      //"availablePowerUps": ["bomb"],
      "length": 50,
      "roadAlters": {},
      //"predefObstacles": {},
      //"jumpHeight": 2,
      "swarms": {},
      //"enemyVariations": ["police"]
    };
    var levelName = $routeParams.level;
    level.powerups = {};
    $http.get('/api/level/' + levelName)
    .success(function(d) {
      $.extend(level, d);
      //$.extend(level.blocks, d.blocks);
      //$.extend(level.offsets, d.offsets);
      //$.extend(level.powerups, d.powerups);
      //$.extend(level.roadAlters, d.roadAlters);
      //$.extend(level.swarms, d.swarms);
      $scope.loaded = true;
    })
    .error(function(e, c) {
      // Redirect back to start if it was a 404.
      if (c === 404) {
        $window.alert('Something went wrong, bacause we can not find this level. Sorry!');
        $location.path('/');
        return;
      }
      $window.alert('Something went wrong, sorry!');
    });
    $scope.possibleBlocks = {
      bricks: true,
      water: true,
      grass: true,
      fire: true
    };
    $scope.possibleObstacles = {
      hole: true,
      wheel: true,
      rock: true
    };
    $scope.possiblePowerUps = {
      nitro: true,
      bomb: true,
      jumps_pu: true,
      invincible: true
    };
    $scope.level = level;
    $scope.makeRoads = function() {
      if (lastlevelLength === parseInt($scope.level.length, 10)) {
        return roads;
      }
      roads = [];
      for (var i = 0; i < $scope.level.length; i++) {
        roads.push(i);
      }
      lastlevelLength = parseInt($scope.level.length, 10);
      return roads;
    };
    $scope.hasPowerup = function(index) {
      var level = $scope.level;
      // Delta will be length - index.
      var delta = level.length - index;
      if (level.powerups && level.powerups[delta]) {
        return true;
      }
      return false;
    };
    $scope.powerUp = function(index) {
      var level = $scope.level;
      var d = level.length - index;
      var pu = level.powerups[d];
      if ($scope.possiblePowerUps[pu]) {
        return pu;
      }
      return false;
    };
    $scope.hasSwarm = function(index) {
      var l = $scope.level;
      if (l.swarms && l.swarms[l.length - index]) {
        return true;
      }
      return false;
    };
    $scope.hasObstacle = function(index) {
      var l = $scope.level;
      if (l.obstacles && l.obstacles[l.length - index]) {
        return true;
      }
      return false;
    };
    $scope.obstacle = function(index) {
      var level = $scope.level;
      var d = level.length - index;
      var o = level.obstacles[d];
      if ($scope.possibleObstacles[o]) {
        return o;
      }
      return false;
    };
    $scope.hasBlock = function(index) {
      var l = $scope.level;
      if (l.blocks && l.blocks[l.length - index]) {
        return true;
      }
      return false;
    };
    $scope.block = function(index) {
      var l = $scope.level;
      var b = l.blocks[l.length - index];
      if ($scope.possibleBlocks[b]) {
        return b;
      }
      return false;
    };
    $scope.getWidth = function(side, index) {
      var level = $scope.level;
      var d = level.length - index;
      if (level.offsets[d] && level.offsets[d][side]) {
        return level.offsets[d][side] / 2;
      }
      return level.minOffset;
    };
    $scope.getSvgPoints = function(side, index) {
      var getRightPoints = function(index) {
        // Calculate how previous point is placed compared to 80 width.
        var w = $scope.getWidth(1, index);
        var pw = $scope.getWidth(1, index - 1);
        var points = [];
        points.push((80 - pw) + ',0');
        points.push('80,0');
        points.push('80,' + $scope.getHeight(index));
        points.push((80 - w) + ',' + $scope.getHeight(index));
        return points.join(' ');
      };
      // For some reason I always just use this for right side.
      return getRightPoints(index);
    };
    $scope.getHeight = function(index) {
      var d = level.length - index;
      if (level.roadAlters[d]) {
        return level.roadAlters[d];
      }
      return 100;
    };
    var sideResized = function(side, index, newVal, skipDigest) {
      var d = level.length - index;
      level.offsets[d] = level.offsets[d] || {};
      level.offsets[d][side] = newVal;
      if (!skipDigest) {
        $scope.$digest();
      }
    };
    $scope.sideResized = function(e, val) {
      // Get index of side.
      var $side = $(e.target);
      var index = $side.attr('data-index');
      var side = $side.attr('data-side');
      var newVal = (val.size.width * 2);
      sideResized(side, index, newVal);
    };
    var saveData = function() {
      // Empty names not allowed.
      if (!$scope.level.name || $scope.level.name === '') {
        return false;
      }
      return $http.post('/api/level', {
        level: $scope.level,
        name: $scope.level.name
      });
    };
    $scope.saveLevel = function() {
      var s = saveData();
      if (!s) {
        $window.alert('Something went wrong');
        return;
      }
      s.success(function() {
        // @todo. Do something?
      })
      .error(function(e, c) {
        if (c === 400) {
          // Name is taken.
          $window.alert(e);
          return;
        }
        $window.alert('We had some problems saving this.');
      });
    };
    $scope.setElementActive = function(type, value) {
      activeElement = {
        type: type,
        value: value
      };
    };

    // Immidiately set something smart as active, so it shows.
    $scope.setElementActive('block', 'bricks');
    $scope.addElement = function(index) {
      if (!index) {
        return;
      }
      if (!activeElement || !activeElement.type || !activeElement.value) {
        return;
      }
      // Use as toggle if there is something there already.
      var delta = (level.length - parseInt(index, 10));
      var possibleToggles = [
        'blocks',
        'powerups',
        'swarms',
        'obstacles'
      ];
      for (var i = 0, len = possibleToggles.length; i < len; i++) {
        var p = possibleToggles[i];
        if ($scope.level[p][delta]) {
          delete $scope.level[p][delta];
          return;
        }
      }
      $scope.level[activeElement.type + 's'][delta] = activeElement.value;
    };
    $scope.isElementActive = function(type, value) {
      return (activeElement && activeElement.type === type && activeElement.value === value);
    };

    $scope.adjustSide = function(index, side, addition) {
      // Get current value of this side.
      var d = $scope.level.length - index;
      var offsets = level.offsets[d] = level.offsets[d] || {};
      var newVal = (offsets[side] ? offsets[side] : 60) + parseInt(addition, 10);
      if (newVal > 120 || newVal < 5) {
        return false;
      }
      return sideResized(side, index, newVal, true);
    };
    // The first of 2 double encoding. I blame java.
    $scope.makePath = function(path) {
      return encodeURIComponent(encodeURIComponent(path));
    };

    var autoSave = function() {
      $http({
        url: '/api/level',
        data: {
          level: $scope.level,
          name: $scope.level.name
        },
        method: 'POST',
        skipLoader: true
      });
    };
    $scope.$watch('level', function(newVal, oldVal) {
      if (newVal === oldVal) {
        // First run.
        return;
      }
      // Save level on each change.
      autoSave();
    }, true);
  }]);

  angular.module('levelCrash.controllers')
  .controller('mainCtrl', ['$scope', '$location', '$http', '$window', function ($scope, $location, $http, $window) {

    // Try to find levels that this person owns.
    $http.get('/api/mylevels')
    .success(function(d) {
      $scope.myLevels = d;
    });
    // Normally you would see an error here as well, but we don't really care
    // in this case.

    // Double encode, appearently.
    $scope.makePath = function(path) {
      return encodeURIComponent(encodeURIComponent(path));
    };

    $scope.tryStepTwo = function() {
      // Validate a couple of things.
      if (!$scope.name || $scope.name.length === 0 || $scope.name.length > 12) {
        var lnmsg = 'Please choose a level name between 1 and 12 characters.';
        $window.alert(lnmsg);
        return;
      }
      if (!$scope.author ||
          $scope.author.length === 0 ||
          $scope.author.length > 12) {
        var nmsg = 'Please use a name between 1 and 12 characters.';
        $window.alert(nmsg);
        return;
      }
      var s = $http.post('/api/level', {
        name: $scope.name,
        level: {
          author: $scope.author,
          length: 50
        }
      });
      s.success(function() {
        $location.path('/level/' + encodeURIComponent($scope.name));
      })
      .error(function() {
        $window.alert('Something went wrong!');
      });
    };
  }]);
})(angular);
