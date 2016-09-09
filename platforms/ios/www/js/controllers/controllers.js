angular.module('starter.controllers', [])

  .controller('homeCtrl', function ($scope, cameraService, itemService, $http, config, good, appinfo, $cordovaDevice, comService) {

    $scope.doHttp = function () {
      console.log('--> doHttp');
      comService.doHttp().then(function (result) {
        console.log("result", result);
        alert("Success: \n\n" + JSON.stringify(result, null, 4));
      }, function (err) {
        console.log("err", err);
        alert("Error: \n\n" + JSON.stringify(err, null, 4));
      });
    }


    $scope.takePicture = function () {
      cameraService.takePhoto().then(function (photo) {
        console.log("success", arguments);
        itemService.addItem(photo);
        alert("picture success");
      }, function (err) {
        console.log("err", err);
        alert("Error: \n\n" + JSON.stringify(err, null, 4));
      });
    };
  })

  .controller('picturesCtrl', function ($scope, itemService, $http, fileService, $cordovaDevice, $q, comService) {
    /**
     * get all items saved in localstorage using itemService
     */
    $scope.pictures = itemService.getItems();

    /**
     * method used to toggle checked state
     * @param picture
     */
    $scope.toggle = function (picture) {
      for (var i = 0; i < $scope.pictures.length; i++) {
        if (picture === $scope.pictures[i]) continue;
        $scope.pictures[i].checked = false;
      }

      if (picture) {
        picture.checked = !picture.checked;
      }
    };

    $scope.sendSelected = function () {
      var defer = $q.defer();

      var picture = $scope.pictures.filter(function (picture) {
        return picture.checked;
      })[0];

      if (picture) {
        comService.doUpload(picture).then(function (result) {
          console.log("result", result);
          alert("Success: \n\n" + JSON.stringify(result, null, 4));
        }, function (err) {
          console.log("err", err);
          alert("Error: \n\n" + JSON.stringify(err, null, 4));
        });
      } else {
        alert("no items selected.");
      }

      return defer.promise;
    }
  })
;
