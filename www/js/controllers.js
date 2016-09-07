angular.module('starter.controllers', [])

.controller('homeCtrl', function($scope, cameraService,itemService) {

    /**
     * method is used to take a picture using camera
     * on success the picture is stored using the itemService
     * else log error
     */

    $scope.takePicture = function () {
        cameraService.takePhoto().then(function(photo){
            console.log("success", arguments);
            itemService.addItem(photo);
        },function(){
            alert("ERROR!");
            console.error("error", arguments);
        });
    };
})

.controller('picturesCtrl', function ($scope, itemService, imageService, $timeout, $http) {
    /**
     * get all items saved in localstorage using itemService
     */
    $scope.pictures = itemService.getItems();

    /**
     * method used to toggle checked state
     * @param picture
     */
    $scope.toggle = function (picture) {
        if(picture){
            picture.checked = !picture.checked;
        }
    };

    $scope.sendSelected = function () {
        var items = $scope.pictures.filter(function (picture) {
            return picture.checked;
        });
        console.log("items: ", items);

        if(items.length>0){
            alert("sending " + items.length + " items.");
        }else{
            alert("no items selected.");
        }
    }
})
;