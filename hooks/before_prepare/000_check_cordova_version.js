#!/usr/bin/env node
"use strict";

console.log("- running hook script: " + __filename);

var CORDOVA_VERSION = "5.4.1";

var currentCordovaVersion = process.env.CORDOVA_VERSION;
if (currentCordovaVersion === CORDOVA_VERSION) {
    console.log("   OK: Cordova version " + CORDOVA_VERSION + " found")
} else {
    var errorMessage = "Error: Incorrect version of Cordova found (" + currentCordovaVersion + "), please install Cordova version " + CORDOVA_VERSION + "\n";
    errorMessage += "   note: to install a specific Cordova version use command: 'npm install -g cordova@" + CORDOVA_VERSION + "'";
    console.log(errorMessage);
    throw new Error(errorMessage);
}

console.log("");
