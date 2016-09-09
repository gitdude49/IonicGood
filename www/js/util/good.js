angular.module('starter.util')

  .factory('good', function () {

    var config = null;

    var isEnabled = function (throwError) {
      var result = false;
      if (window.plugins && window.plugins.GDApplication) {
        //we test if Good is enabled by checking for existence of the Good class "window.plugins.GDApplication"
        result = true;
      }
      if (!result && throwError) {
        throw new Error("The app is not Good enabled");
      }
      return result;
    };

    var update = function () {
      console.log("--> good.update");
      if (isEnabled()) {
        console.log("we are Good enabled, get application config");
        window.plugins.GDApplication.getApplicationConfig(
          function (_config_) {
            console.log("Good GDApplication.getApplicationConfig success, config: " + _config_, _config_);
            config = JSON.parse(_config_);
          },
          function (err) {
            console.error("Good GDApplication.getApplicationConfig error, err: " + err);
            throw err;
          }
        );
      } else {
        console.log("we are not Good enabled, do nothing");
      }
      console.log("<-- good.update");
    };

    var hasConfig = function () {
      return (config !== null);
    };

    var getConfig = function () {
      console.log("--> good.getConfig");
      if (!config) {
        throw new Error("The Good config is not available");
      }
      var result = config;
      console.log("<-- good.getConfig, result: " + result);
      return result;
    };

    var getUserId = function () {
      var result;
      if (isEnabled(true)) {
        var config = getConfig();
        result = config.userId;

        var elements = result.split("@");
        if (elements.length == 2) {
          result = elements[0];
        } else {
          throw new Error("Failed to extract username part from the 'userId' provided by Good. (was looking for '@' character");
        }
      }
      if (!result) {
        throw new Error("UserId not found in Good config");
      }
      return result;
    };

    var getServerUrl = function () {
      var result;
      if (isEnabled(true)) {
        var config = getConfig();
        if (config.appServers && config.appServers.length > 0) {
          //gets the server with the highest priority
          var appServers = config.appServers;
          appServers = appServers.sort(function (a, b) {
            return (a.priority - b.priority);
          });

          var appServer = config.appServers[0];

          var server = appServer.server;
          var port = appServer.port;

          if (port === 80) {
            result = "http://" + server;
          } else if (port === 443) {
            result = "https://" + server;
          } else {
            throw new Error("the Good config has a server defined however we can't handle the defined port number (we only support ports 80 & 443), the defined port is:" + port);
          }
        } else {
          console.log("the Good config doesn't have any servers defined, do nothing");
        }
      }
      return result;
    };

    var showPreferenceUI = function (onSuccess, onError) {
      console.log("--> good.showPreferenceUI");
      if (!onSuccess) {
        throw new Error("the onSuccess parameter is required");
      }
      if (!onError) {
        throw new Error("the onError parameter is required");
      }
      window.plugins.GDApplication.showPreferenceUI(
        function (result) {
          console.log("--> window.plugins.GDApplication.showPreferenceUI success");
          console.log("result", result);
          onSuccess(result);
          console.log("<-- window.plugins.GDApplication.showPreferenceUI success");
        },
        function (result) {
          console.log("--> window.plugins.GDApplication.showPreferenceUI error");
          console.log("result", result);
          onError(result);
          console.log("<-- window.plugins.GDApplication.showPreferenceUI error");
        }
      );
      console.log("--> good.showPreferenceUI");
    };

    return {
      isEnabled: isEnabled,
      update: update,
      hasConfig: hasConfig,
      getUserId: getUserId,
      getServerUrl: getServerUrl,
      showPreferenceUI: showPreferenceUI
    };
  })

;
