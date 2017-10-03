(function () {
  'use strict';

  angular.module('App')
  .factory('test', ($mdDialog, $mdToast) => {
    var users = [{
      id: 0,
      name: 'John doe',
      age: 18
    },{
      id: 1,
      name: 'Sherlock Holmes',
      age: 34
    },{
      id: 2,
      name: 'Jon Snow',
      age: 29
    }]

    users.addUser = (user) => {
      users.push(user);
    }

    users.getUser = (index) => {
      return (index >= 0 && index < users.length) ? users[index] : null;
    }
    
    return users;
  })

}());
