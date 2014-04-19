;(function(angular) {
  'use strict';
  angular.module('ajaxLoader', [])
  .directive('ajaxLoader', ['$http' ,function ($http) {
    return {
      restrict: 'A',
      link: function (scope, elm) {
        scope.isLoading = function () {
          var loaders = 0;
          for (var i = $http.pendingRequests.length - 1; i >= 0; i--) {
            var h = $http.pendingRequests[i];
            if (!h.skipLoader) {
              loaders++;
            }
          }
          return loaders > 0;
        };

        scope.$watch(scope.isLoading, function (v) {
          if (v) {
            elm[0].style.display = 'block';
          }
          else {
            elm[0].style.display = 'none';
          }
        });
      },
      template: '<div class="loading-spinner-holder"><div class="inner"><h1><i class="dot-1"></i><i class="dot-2"></i><i class="dot-3"></i><i class="dot-4"></i></h1></div><div class="background"></div></div>'
    };
  }]);


}(angular));
