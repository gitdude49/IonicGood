angular.module('starter.services')
    .factory("cameraService", function ($q, $cordovaCamera, $ionicPopup, $ionicLoading, imageService) {

        var takePhoto = function() {
            console.log("--> cameraService.takePhoto");

            if (!cordova.isLocal) {
                //when running on device: invoke the camera
                return $q(function(resolve, reject) {
                    takePhotoInternal(resolve, reject);
                });
            } else {
                //when running in browser ask if we need to take a picture using webcam
                //(this is here to simulate the user canceling taking a photo)
                return $q(function(resolve, reject){
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Simulate camera',
                        template: 'Do you want to take a picture using the webcam?'
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            takePhotoInternal(resolve, reject);
                        } else {
                            reject("Camera cancelled.");
                        }
                    });
                });

            }
        };

        var takePhotoInternal = function(resolve, reject) {
            console.log("--> cameraService.takePhotoInternal");

            var options = {
                quality: 90, //Default quality for the camera plugin is 50, we increase the quality

                /*
                Note about destinationType:
                To function correctly in a Good enabled app use the type "DATA_URL"
                (Good can't access the filesystem where the camera stores the photo file when using "FILE_URL"
                 */
                destinationType: Camera.DestinationType.DATA_URL,
                //destinationType: Camera.DestinationType.FILE_URI,

                sourceType: Camera.PictureSourceType.CAMERA,
                //allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                saveToPhotoAlbum: false,
                correctOrientation:true
            };
            
            $ionicLoading.show();

            $cordovaCamera.getPicture(options).then(function(data) {
                console.log("--> $cordovaCamera.getPicture.success");

                if (options.destinationType === Camera.DestinationType.DATA_URL) {
                    //the camera plugins return a dataUrl without any meta-information, we need to add the meta-information
                    data = "data:image/jpeg;base64," + data;
                }


                imageService.addImage(data, 'photo').then(function(entry) {
                    $ionicLoading.hide();
                    resolve(entry);
                }, function(err) {
                    $ionicLoading.hide();
                    reject(err);
                });

            }, function(err) {
                console.log("--> $cordovaCamera.getPicture.error, err: ", err);
                $ionicLoading.hide();

                if(err !== "no image selected") {
                    reject(err);
                }
            });
        };

        return {
            takePhoto: takePhoto
        };

    });