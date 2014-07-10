;(function(angular) {
  angular.module('levelCrash.directives')
  .directive('dashboard', function() {
    return {
      templateUrl: '/js/components/dashboard/dashboard.html?DEPLOY_CACHE'
    };
  });
}(angular));
