;(function(angular) {

  angular.module('levelCrash', [
    'ngRoute',
    'ngTouch',
    'levelCrash.controllers',
    'levelCrash.directives',
    'jui'
  ])

  .config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/', {
      templateUrl: '/partials/main.html',
      controller: 'mainCtrl'})
    .when('/level/:level', {
      templateUrl: '/partials/level.html',
      controller: 'levelCtrl'
    });
    $routeProvider.otherwise({redirectTo: '/'});
  });

  angular.module('levelCrash.controllers', [], function(){});
  angular.module('levelCrash.directives', [], function(){});
})(angular);
