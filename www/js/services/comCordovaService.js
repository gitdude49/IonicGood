angular.module('starter.services')

  .factory('comCordovaService', function ($http, fileService) {

    var doHttp = function(req) {
      console.log('--> doHttp');
      return $http(req);
    }

    var doUpload = function(req, photo) {
      console.log('--> doUpload');

      var filename = photo.title;
      if (photo.filenameFull.lastIndexOf(".") !== -1) {
        filename = photo.title + photo.filenameFull.substr(photo.filenameFull.lastIndexOf("."));
      }

      var options = {
        fileKey: "foto",
        fileName: filename,
        params: req.data,
        headers: req.headers
      };

      return fileService.upload(photo.filenameFull, req.url, options);
    }

    return {
      doHttp: doHttp,
      doUpload: doUpload
    }

  })

;
