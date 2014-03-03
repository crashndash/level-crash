;(function(angular) {
  angular.module('levelCrash.controllers', [])
  .controller('mainCtrl', function ($scope) {
    var level = {
      "obstacles": {},
      "jumpDuration": 1.5,
      "powerFreq": 0,
      "obstacleFreq": 0,
      "jumpCount": 11,
      "minOffset": 60,
      "maxOffset": 90,
      "powerups": {
        40: 'bomb'
      },
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
      "length": 40,
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
      jump_pu: true
    };
    $scope.makeRoads = function() {
      var roads = [];
      for (var i = 0; i < $scope.level.length; i++) {
        roads.push('a');
      }
      return roads;
    };
    $scope.roadResized = function(e, val) {
      console.log(val.size);
    };
    $scope.hasPowerup = function(index) {
      var level = $scope.level;
      // Delta will be length - index.
      var delta = level.length - index;
      if (level.powerups[delta]) {
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
      if (level.roadAlters[d]) {
        return level.offsets[d][side];
      }
      return level.minOffset;
    };
    $scope.dropped = function(e, val) {
      // Find element that has been dropped something on.
      console.log(e, val);
      var $el = $(e.target);
      var index = $el.attr('data-index');
      console.log($el.attr('data-index'));
      level.powerups[index] = 'bomb';
    };
    $scope.level = level;
    $scope.test = 'test2';
  });
})(angular);
