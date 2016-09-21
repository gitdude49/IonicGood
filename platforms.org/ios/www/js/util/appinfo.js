angular.module('starter.util')

  .factory('appinfo', function () {

    var getAppName = function () {
      return "IonicGood";
    };

    var getAppVersion = function () {
      return "1.0.0";
    };

    return {
      getAppName: getAppName,
      getAppVersion: getAppVersion
    };
  })

;
