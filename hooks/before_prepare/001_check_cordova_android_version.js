#!/usr/bin/env node
"use strict";

console.log("- running hook script: " + __filename);

var CORDOVA_ANDROID_VERSION = "4.1.1";

var fs = require("../../node_modules/fs-extra");
var bf = require('../../scripts/BLAUD/build_functions.js');

var CORDOVA_ANDROID_VERSION_FILE = "./platforms/android/cordova/version";

if (!bf.isAndroidBuild()) {
    console.log("   there's no android platform, nothing to do");
} else {
    if (fs.existsSync(CORDOVA_ANDROID_VERSION_FILE)) {
        var versionFile = fs.readFileSync(CORDOVA_ANDROID_VERSION_FILE, "utf8");

        //regular expression to find version number
        var regex = /var *VERSION *= *"(.*)"/

        var result = regex.exec(versionFile);

        if (result.length === 2) {
            var currentCordovaAndroidVersion = result[1];
            if (currentCordovaAndroidVersion === CORDOVA_ANDROID_VERSION) {
                console.log("   OK: Cordova Android version " + CORDOVA_ANDROID_VERSION + " found");
            } else {
                var errorMessage = "Error: Incorrect version of Cordova-android found (" + currentCordovaAndroidVersion + "), please install Cordova-Android version " + CORDOVA_ANDROID_VERSION + "\n";
                errorMessage += "   note: to install a specific Cordova-Android version use command: 'cordova platforn add android@" + CORDOVA_ANDROID_VERSION + "'"
                console.log(errorMessage);
                throw new Error(errorMessage);
            }
        } else {
            var errorMessage = "Error: could not find version information in Android platform version file\n";
            errorMessage += "   Android platform version file: " + CORDOVA_ANDROID_VERSION_FILE + "\n";
            errorMessage += "   was looking for line in format like: 'var VERSION = \"<version number>\"'";
            console.log(errorMessage);
            throw new Error(errorMessage);
        }
    } else {
        var errorMessage = "Error: Android platform version file not found, expected file at: " + CORDOVA_ANDROID_VERSION_FILE;
        console.log(errorMessage);
        throw new Error(errorMessage);

        console.log("Error: could not find version information in Android platform version file");
        console.log("   Android platform version file: " + CORDOVA_ANDROID_VERSION_FILE);
        throw new Error("Could not find 'GDApplicationVersion' in Good settings file: " + GOOD_SETTINGSFILE);
    }
}

console.log("");
