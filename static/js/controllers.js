;(function(angular) {
  angular.module('levelCrash.controllers')
  .controller('levelCtrl', function ($scope, $timeout, $http, $routeParams, $location) {
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
        alert('Something went wrong, bacause we can not find this level. Sorry!');
        $location.path('/');
        return;
      }
      alert('Something went wrong, sorry!');
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
        roads.push('a');
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
      if (side === 1) {
        return getRightPoints(index);
      }
      return getLeftPoints(index);
    };
    $scope.getBackgroundImage = function(side, index) {
      var w = $scope.getWidth(side, index);
      var pw = $scope.getWidth(side, index - 1);
      if (w === pw) {
        return 'green-3.png';
      }
      if (w > pw) {
        return 'green-1.png';
      }
      return 'green-2.png';
    };
    $scope.getHeight = function(index) {
      var d = level.length - index;
      if (level.roadAlters[d]) {
        return level.roadAlters[d];
      }
      return 100;
    };
    $scope.getBorderTop = function(side, index) {
      // If the previous segment was wider than this, return the height of the
      // segment.
      var width = $scope.getWidth(side, index);
      var prevWidth = $scope.getWidth(side, index - 1);
      if (width <= prevWidth) {
        return $scope.getHeight(index);
      }
      return 0;

    };
    $scope.getBorderBottom = function(side, index) {
      var width = $scope.getWidth(side, index);
      var prevWidth = $scope.getWidth(side, index - 1);
      if (width > prevWidth) {
        return $scope.getHeight(index);
      }
      return 0;
    };
    $scope.getBorderLeft = function(side, index, force) {
      if (side === 0 && !force) {
        return 0;
      }
      // Just return the difference between this one and the last one.
      var width = $scope.getWidth(side, index);
      var prevWidth = $scope.getWidth(side, index - 1);

      // I think we always want to return a positive value.
      var value = prevWidth - width;
      if (value < 0) {
        value = value * -1;
      }
      else {
        value = value * 2;
      }
      return value;
    };
    $scope.getOffsetWidth = function(side, index) {
      var width = $scope.getWidth(side, index);
      return width;
    };
    $scope.getBorderRight = function(side, index) {
      if (side === 0) {
        return $scope.getBorderLeft(side, index, true);
      }
      return 0;
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
        alert('Something went wrong');
        return;
      }
      s.success(function(data) {
        console.log(data);
      })
      .error(function(e, c) {
        console.log(e, c);
        if (c === 400) {
          // Name is taken.
          alert(e);
          return;
        }
        alert('We had some problems saving this.');
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
      console.log('trying to add at index' + index);
      console.log(activeElement);
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
      for (i = 0, len = possibleToggles.length; i < len; i++) {
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

    $scope.swipeLeft = function(index, event) {
      var clientX;
      if (event && event.changedTouches && event.changedTouches[0] && event.changedTouches[0].clientX) {
        clientX = event.changedTouches[0].clientX;
      }
      else {
        return;
      }
      // If the swipe ended up on the left side of 1/3 of the screen, edit left
      //side of road
      var width = window.innerWidth;
      var side, newVal;
      if (width / 2.5 > clientX) {
        // Fake a resize event.
        side = 0;
        newVal = 40;
        if (level.offsets[level.length - index] && level.offsets[level.length - index][side]) {
          newVal = level.offsets[level.length - index][side] - 20;
        }
      }
      else {
        side = 1;
        newVal = 60;
        if (level.offsets[level.length - index] && level.offsets[level.length - index][side]) {
          newVal = level.offsets[level.length - index][side] + 20;
        }
      }
      sideResized(side, index, newVal, true);
    };
    $scope.swipeRight = function(index, event) {
      var clientX;
      if (event && event.changedTouches && event.changedTouches[0] && event.changedTouches[0].clientX) {
        clientX = event.changedTouches[0].clientX;
      }
      else {
        return;
      }
      // If the swipe ended up on the left side of 1/3 of the screen, edit left
      //side of road
      var width = window.innerWidth;
      var side, newVal;
      console.log(clientX);
      if (width - width / 3.5 > clientX) {
        // Fake a resize event.
        side = 0;
        newVal = 70;
        if (level.offsets[level.length - index] && level.offsets[level.length - index][side]) {
          newVal = level.offsets[level.length - index][side] + 20;
        }
      }
      else {
        side = 1;
        newVal = 10;
        if (level.offsets[level.length - index] && level.offsets[level.length - index][side]) {
          newVal = level.offsets[level.length - index][side] - 20;
        }
      }
      sideResized(side, index, newVal, true);
    };
  });

  angular.module('levelCrash.controllers')
  .controller('mainCtrl', function ($scope, $location, $http) {

    // Try to find levels that this person owns.
    $http.get('/api/mylevels')
    .success(function(d) {
      $scope.myLevels = d;
    })
    .error(function(e, c) {
      console.log(e, c);
    });

    $scope.errors = [];

    $scope.tryStepTwo = function() {
      // Validate a couple of things.
      if (!$scope.name || $scope.name.length === 0 || $scope.name.length > 12) {
        return;
      }
      if (!$scope.author|| $scope.author.length === 0 || $scope.author.length > 12) {
        return;
      }
      var s = $http.post('/api/level', {
        name: $scope.name,
        level: {
          author: $scope.author
        }
      });
      if (!s) {
        alert('Something went wrong!');
        return;
      }
      s.success(function(d) {
        $location.path('/level/' + $scope.name);
      })
      .error(function() {
        alert('Something went wrong!');
      });
    };
  });
})(angular);
