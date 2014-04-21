;(function(angular) {
  angular.module('levelAdmin', [])
  .controller('adminCtrl', function($scope, $http) {
    var loadLevels = function() {
      $http.get('/api/level')
      .success(function(d) {
        $scope.levels = d;
      });
    };
    loadLevels();
    $scope.deleteLevel = function(level) {
      if (window.confirm('Are you sure you want to delete the level' + level + '?')) {
        $http.delete('/admin/level/' + level)
        .success(function(d) {
          loadLevels();
        });
      }
    };
    $scope.loadLevel = function(level) {
      window.location.href = '/level/' + level;
    };
  });
}(angular));
