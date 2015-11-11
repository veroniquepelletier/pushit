'use strict';

/**
 * @ngdoc overview
 * @name pushit
 * @description
 * # pushit
 *
 * Main module of the application.
 */
angular
  .module('app', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    $routeProvider
      .when('/', {
        templateUrl: 'panes/home.html',
        controller: 'homeCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function() {
    window.console.log('new app');
  });
