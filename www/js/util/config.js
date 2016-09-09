angular.module('starter.util')

  .factory('config', function () {

    var getConfig = function () {
      return {
        //server: "http://localhost:3000"
        server: "http://mia-preview.azurewebsites.net"
        //server: "http://192.168.1.239:3000"
      };
    };

    return {
      getConfig: getConfig
    };
  })

;
