angular.module('starter.services')
    .factory("imageService", function ($q, $cordovaFile, thumbnailService, fileService) {

        var IMAGEDIR = "mia/";

        var getDataUrl = function (type, filename) {
            return $q(function(resolve, reject){
                fileService.toDataURL(filename).then(function(data) {
                    if (data.indexOf("data:") === -1) {
                        //Good returns dataUrls without metadata, we need to add the metadata
                        var imageType = filename.substr(filename.lastIndexOf(".")+1);
                        data  = "data:image/" + imageType + ";base64," + data;
                        resolve(data);
                    } else {
                        resolve(data);
                    }
                }, reject);
            });
        };

        var getImageFull = function(obj) {
            return getDataUrl(obj.type, obj.filenameFull);
        };

        var getImageThumbnail = function(obj) {
            return getDataUrl(obj.type, obj.filenameThumbnail);
        };

        /*
         Add image
         Paramater is either a "dataUrl" or a filename
         */
        var addImage = function(data, type) {
            var type = type || 'photo';
            console.log("--> photoService.addPhoto");

            return $q(function(resolve, reject){
                if (data.indexOf("data:") === 0) {
                    //we've got a dataUrl
                    addByDataUrl(data, resolve, reject);
                } else {
                    //asume we've got a filename
                    addByFilename(data, resolve, reject);
                }
            });

            function addByFilename(filename, resolve, reject) {
                console.log("--> photoService.addPhoto.addByFilename");
                window.resolveLocalFileSystemURL(filename, function(entry) {
                    var sourceFilesystem = entry.filesystem.root.toURL();
                    var sourceFile = entry.name;
                    $cordovaFile.readAsDataURL(sourceFilesystem, sourceFile).then(function(photoFullData) {
                        addByDataUrl(photoFullData, resolve, reject);
                    }, reject);
                }, function(err) {
                    reject(err);
                });
            }

            function addByDataUrl(dataUrl, resolve, reject) {
                console.log("--> photoService.addPhoto.addByDataUrl");
                var blob = dataURItoBlob(dataUrl);

                var blobType = getTypeFromBlob(blob);
                if (blobType !== "image") {
                    reject("invalid blob type, expected image, got: " + blobType);
                }

                var filenamePhotoFull = IMAGEDIR + type + "/" + new Date().getTime() + "." + getFilenameExtensionFromBlob(blob);

                var indexLastdot = filenamePhotoFull.lastIndexOf(".");
                var filenamePhotoThumbnail = filenamePhotoFull.substring(0, indexLastdot) + "_thumb" + filenamePhotoFull.substr(indexLastdot);

                console.log("saving full photo", filenamePhotoFull);

                fileService.write(filenamePhotoFull, blob).then(function() {
                    console.log("full photo saved ", filenamePhotoFull);

                    var imageFull = new Image();
                    imageFull.src = dataUrl;
                    imageFull.onload = function () {
                        console.log("generating thumbnail");
                        thumbnailService.generate(imageFull).then(function(photoThumbnailData) {
                            console.log("thumbnail");

                            console.log("saving thumbnail", filenamePhotoThumbnail);
                            var thumbnailBlob = dataURItoBlob(photoThumbnailData);

                            fileService.write(filenamePhotoThumbnail, thumbnailBlob).then(function() {
                                console.log("thumbnail saved", filenamePhotoThumbnail);

                                var imageThumbnail = new Image();
                                imageThumbnail.src = photoThumbnailData;

                                console.log("creating photo object");
                                var image = new _Image(null, type);
                                image.filenameFull = filenamePhotoFull;
                                image.filenameThumbnail = filenamePhotoThumbnail;

                                image.size.orig.width = imageFull.width;
                                image.size.orig.height = imageFull.height;

                                image.size.thumb.width = imageThumbnail.width;
                                image.size.thumb.height = imageThumbnail.height;

                                var title = fileService.filename(filenamePhotoFull);
                                if (title.lastIndexOf(".") > 0) {
                                    //we are testing for "> 0" to make sure something is left after substr'ing (as we have generated the filename for this ourselves we could as well leave away this check...)
                                    title = title.substr(0,title.lastIndexOf("."));
                                }
                                image.title = title;

                                console.log("photo object created", image);

                                resolve(image);
                            });

                        });
                    };

                    imageFull.onerror = function (error) {
                        reject(error);
                    }

                });

            }

        };

        var removeImage = function (data) {
            return $q(function(resolve, reject){
                fileService.remove(data.filenameFull)
                    .then(fileService.remove(data.filenameThumbnail))
                    .then(resolve, reject);
            });
        };

        return {
            addImage: addImage,
            removeImage: removeImage,
            getImageFull: getImageFull,
            getImageThumbnail: getImageThumbnail
        };

    });