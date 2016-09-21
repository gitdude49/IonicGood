angular.module('starter.services')

  .factory('comService', function ($http, $cordovaDevice, config, good, appinfo, fileService, comCordovaService, comGoodService) {
    console.log("--> comService");

    var createUrl = function(path, query) {
      var uri = new URI(config.getConfig().server);
      if (path) {
        uri.path(path);
      }
      if (query) {
        uri.addSearch(query);
      }
      return uri.toString();
    };

    var setHeaders = function (req) {
      console.log("--> setHeaders");

      /*
       Check to see if we need to do Basic Authentication on a request
       */
      var doBasicAuthentication = function(req) {
        if (!req) {
          throw new Error("parameter req is required");
        }
        if (!req.url) {
          throw new Error("parameter req should contain an url property");
        }

        return req.url.indexOf("http://mia-master.azurewebsites.net") !== -1 ||
          req.url.indexOf("http://mia-preview.azurewebsites.net") !== -1 ||
          req.url.indexOf("http://localhost") !== -1 ||
          req.url.indexOf("http://ds.schoonderwoerd.com") !== -1 ||
          req.url.indexOf("http://192.168.1.239") !== -1;
      };

      // Set headers
      if (!req.headers) {
        console.log("req.headers doesn't exist, creating");
        req.headers = {};
      } else {
        console.log("req.headers does exist");
      }

      /*jshint -W069 */ //exception to not enforce .dot notation
      req.headers['Accept'] = "application/json";
      req.headers['X-S-Username'] = good.isEnabled() ? good.getUserId() : "DummyUserName_AppIsNotGoodEnabled";
      req.headers['X-S-UserEmailAddress'] = good.isEnabled() ? good.getUserId() : "DummyUserEmailAddress_AppIsNotGoodEnabled";
      req.headers['X-S-Platform'] = $cordovaDevice.getPlatform();
      req.headers['X-S-PlatformVersion'] = $cordovaDevice.getVersion();
      req.headers['X-S-AppName'] = appinfo.getAppName();
      req.headers['X-S-AppVersion'] = appinfo.getAppVersion();
      if (doBasicAuthentication(req)) {
        req.headers['Authorization'] = "Basic " + btoa("user:superSecr");
      }
      /*jshint +W069 */

      console.log("req.headers", req.headers);
    };

    var doHttp = function() {
      console.log('--> doHttp');

      var req = {
        method: "GET",
        url: createUrl("/api/personen", {sleuteltype:0, sleutelwaarde: "123456782"})
      };

      setHeaders(req);
      console.log(req);

      if (good.isEnabled()) {
        return comGoodService.doHttp(req);
      } else {
        return comCordovaService.doHttp(req);
      }

    }

    var doUpload = function(picture) {
      console.log('--> doUpload');
      console.log('picture', picture);

      var req = {
        method: "POST",
        url: createUrl("/api/foto"),
        data: {zaakId: 1}
      };

      setHeaders(req);
      console.log(req);

      if (good.isEnabled()) {
        return comGoodService.doUpload(req, picture);
      } else {
        return comCordovaService.doUpload(req, picture);
      }
    }

    return {
      doHttp: doHttp,
      doUpload: doUpload
    }

  })

;
