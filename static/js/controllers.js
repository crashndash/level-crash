;(function(angular) {
  angular.module('levelCrash.controllers', [])
  .controller('mainCtrl', function ($scope, $timeout) {
    var roads = [];
    var lastlevelLength;
    var level = {
      "obstacles": {},
      "jumpDuration": 1.5,
      "powerFreq": 0,
      "obstacleFreq": 0,
      "jumpCount": 11,
      "minOffset": 30,
      "maxOffset": 30,
      //"powerups": {
      //  40: 'bomb'
      //},
      "speedFactor": 1,
      "tagline": "The police are after you!",
      "availableObstacles": ["wheel"],
      "carWeight": 10,
      "blocks": {},
      "spawnFrequency": 100,
      "offsets": {},
      "enemyLimit": 5,
      "impulsefactor": 80,
      "theme": "grass",
      "availablePowerUps": ["bomb"],
      "length": 10,
      "roadAlters": {},
      "predefObstacles": {},
      "jumpHeight": 2,
      "swarms": [],
      "enemyVariations": ["police"]
    };
    // Make the level as long as the length says.
    var possiblePowerUps = {
      nitro: true,
      bomb: true,
      jumps_pu: true
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
    $scope.roadResized = function(e, val) {
      // Save for later. First find delta.
      console.log(e, val);
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
    $scope.getWidth = function(side, index) {
      var level = $scope.level;
      var d = level.length - index;
      if (level.offsets[d] && level.offsets[d][side]) {
        return level.offsets[d][side] / 2;
      }
      return level.minOffset;
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
    $scope.dropped = function(e, val) {
      // Find element that has been dropped something on.
      var $el = $(e.target);
      var $source = $(e.srcElement);
      var index = $el.attr('data-index');
      var powerup = $source.attr('data-powerup');
      level.powerups[(level.length - parseInt(index, 10))] = powerup;
      $scope.$digest();
      // Reset src-element.
      $(e.srcElement).css('top', '');
      $(e.srcElement).css('left', '');
    };
    $scope.test = 'test2';
    $scope.step = 1;
  });
})(angular);
