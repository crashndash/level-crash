;(function(angular) {

  angular.module('levelCrash', [
    'ngRoute',
    'ngTouch',
    'levelCrash.controllers',
    'levelCrash.directives',
    'jui',
    'ajaxLoader'
  ])

  .config([
    '$compileProvider',
    '$routeProvider',
    '$locationProvider',
    function($compileProvider, $routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/', {
      templateUrl: '/partials/main.html',
      controller: 'mainCtrl'})
    .when('/level/:level', {
      templateUrl: '/partials/level.html',
      controller: 'levelCtrl'
    });
    $routeProvider.otherwise({redirectTo: '/'});

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|fb462788903779716):/);
  }]);

  angular.module('levelCrash.controllers', [], function(){});
  angular.module('levelCrash.directives', [], function(){});
})(angular);
