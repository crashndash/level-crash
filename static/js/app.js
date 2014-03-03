;(function(angular) {

  angular.module('levelCrash', [
    'ngRoute',
    'levelCrash.controllers',
    'jui'
  ])

  .config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/', {
      templateUrl: '/partials/main.html',
      controller: 'mainCtrl'});
    $routeProvider.otherwise({redirectTo: '/'});
  });

  angular.module('levelCrash.controllers', [], function(){});
})(angular);
