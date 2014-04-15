;(function(angular) {
  angular.module('levelCrash.controllers')
  .controller('mainCtrl', function ($scope, $timeout, $http) {
    var roads = [];
    var lastlevelLength;
    var activeElement;
    var level = {
      //"obstacles": {},
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
      "swarms": [],
      //"enemyVariations": ["police"]
    };
    level.powerups = {};
    // Make the level as long as the length says.
    var possiblePowerUps = {
      nitro: true,
      bomb: true,
      jumps_pu: true
    };
    $scope.possibleBlocks = {
      bricks: true,
      water: true,
      grass: true,
      fire: true
    };
    $scope.possiblePowerUps = possiblePowerUps;
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
      if (possiblePowerUps[pu]) {
        return pu;
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
    $scope.sideResized = function(e, val) {
      // Get index of side.
      var $side = $(e.target);
      var index = $side.attr('data-index');
      var side = $side.attr('data-side');
      var d = level.length - index;
      level.offsets[d] = level.offsets[d] || {};
      level.offsets[d][side] = (val.size.width * 2);
      $scope.$digest();
    };
    var saveData = function() {
      // Empty names not allowed.
      if (!$scope.name || $scope.name === '') {
        return false;
      }
      return $http.post('/api/level', {
        level: $scope.level,
        name: $scope.name
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
    $scope.addElement = function(index) {
      if (!activeElement || !activeElement.type || !activeElement.value) {
        return;
      }
      // Use as toggle if there is something there already.
      var delta = (level.length - parseInt(index, 10));
      if ($scope.level.blocks[delta]) {
        delete $scope.level.blocks[delta];
        return;
      }
      if ($scope.level.powerups[delta]) {
        delete $scope.level.powerups[delta];
        return;
      }
      $scope.level[activeElement.type + 's'][delta] = activeElement.value;
    };
    $scope.isElementActive = function(type, value) {
      return (activeElement && activeElement.type === type && activeElement.value === value);
    };

    $scope.step = 1;
    $scope.tryStepTwo = function() {
      // Validate a couple of things.
      if (!$scope.name || $scope.name.length === 0 || $scope.name.length > 15) {
        return;
      }
      if (!$scope.level.author|| $scope.level.author.length === 0 || $scope.level.author.length > 15) {
        return;
      }
      var s = saveData();
      if (!s) {
        alert('Something went wrong!');
        return;
      }
      s.success(function() {
        $scope.step = 2;
      })
      .error(function() {
        alert('Something went wrong!');
      });
    };
  });
})(angular);
