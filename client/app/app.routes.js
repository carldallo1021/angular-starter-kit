(function () {
  'use strict'

  angular.module('App')
    .config(($stateProvider) => {
      $stateProvider
        .state('home', {
          url: '/'
        })
    });
    
}());
