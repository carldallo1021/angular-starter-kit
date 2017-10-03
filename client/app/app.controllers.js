(function () {
  'use strict';

  angular.module('App')
  .controller('helloCtrl', ($scope) => {
    $scope.message = 'Hello World'
  });

}());
