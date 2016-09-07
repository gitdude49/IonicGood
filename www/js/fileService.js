angular.module('starter.services')
    .factory("fileService", function ($q) {
        console.log("--> fileService");

        return CordovaPromiseFS({
            //persistent: true, // or false
            fileSystem: cordova.file.externalApplicationStorageDirectory,
            storageSize: 20*1024*1024, // storage size in bytes, default 20MB
            concurrency: 3, // how many concurrent uploads/downloads?
            Promise: $q
        });

    })