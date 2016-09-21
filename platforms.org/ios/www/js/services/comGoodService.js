angular.module('starter.services')

  .factory('comGoodService', function ($q, fileService) {

    var doHttp = function(req) {
      console.log('--> comGoodService.doHttp');

      var defer = $q.defer();

      var isAsync = true;
      var request = window.plugins.GDHttpRequest.createRequest(req.method, req.url, 30, isAsync);

      //Transfer headers from req to the Good request
      if (req.headers) {
        for (var header in req.headers) {
          if (req.headers.hasOwnProperty(header)) {
            var key = header;
            var value = req.headers[header];
            request.addRequestHeader(key, value);
          }
        }
      }

      if (req.method === "POST") {
        console.log("going to post data");

        if (req.data) {
          console.log("has data, adding to httpBody");
          var httpBody = JSON.stringify(req.data);
          console.log("httpBody: " + httpBody);
          request.addHttpBody(httpBody);

          request.addRequestHeader("content-type", "application/json;charset=UTF-8");
        } else {
          throw new Error("performing POST but no data was provided in req");
        }
      }

      var millisStart = Date.now();
      request.send(
        function (responseRaw) {
          //Remember, Good returns a "raw" response
          console.log("--> window.plugins.GDHttpRequest success, responseRaw", responseRaw);

          //Parse the "raw" response
          var response = window.plugins.GDHttpRequest.parseHttpResponse(responseRaw);
          console.log("response", response);

          var millisEnd = Date.now();
          console.log("took: " + (millisEnd - millisStart));

          if (response.status === 200 || response.status === 204) {
            console.log("response.status is: 200/204 , looks ok!");
            var result = {
              data: ""
            };
            if (response.responseText !== "") {
              console.log("found response.responseText, going to parse as JSON");
              try {
                result.data = JSON.parse(response.responseText);
                console.log("JSON parse success, resolve promise");
                defer.resolve(result);
              } catch(e) {
                console.log("JSON parse error, reject promise");
                defer.reject(result);
              }
            } else {
              console.log("did not find response.responseText, resolve promise");
              if (req.method === "POST") {
                console.log("the req.method is POST, we accept response without data, resolve promise");
                result.data = "";
                defer.resolve(result);
              } else {
                console.log("the req.method is not POST, we don't accept response without data, reject promise");
                defer.reject(result);
              }
            }
          } else {
            console.log("response.status !== 200, reject!");
            defer.reject(response);
          }
        },
        function (err) {
          console.log("--> window.plugins.GDHttpRequest err: "  + err, err);

          defer.reject(err);
        }
      );

      return defer.promise;
    }

    var doUpload = function(req, photo) {
      console.log('--> doUpload');

      var def = $q.defer();

      console.log('going to get url for filenameFull, photo.filenameFull:', photo.filenameFull);

      fileService.toURL(photo.filenameFull).then(function(fileUrl) {
        console.log("got URL for photo.filenameFull", fileUrl);

        var filename = photo.filenameFull;

        var options = new FileUploadOptions();
        options.fileKey = "foto";
        options.fileName = fileService.filename(filename);
        options.params = req.data;
        options.mimeType = "text/plain";
        options.headers = req.headers;

        console.log("fileUrl", fileUrl);
        console.log("req.url", req.url);
        console.log("options", options);

        return fileService.upload(fileUrl, req.url, options).then(function(result){
          console.log("result", result);
          def.resolve(result);
        }, function(err) {
          console.log("err", err);
          def.reject(err);
        });
      });

      return def.promise;
    }

    return {
      doHttp: doHttp,
      doUpload: doUpload
    }

  })

;
