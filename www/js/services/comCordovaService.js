angular.module('starter.services')

  .factory('comCordovaService', function ($http) {

    var doHttp = function(req) {
      console.log('--> doHttp');
      return $http(req);
    }

    return {
      doHttp: doHttp
    }

  })

;
