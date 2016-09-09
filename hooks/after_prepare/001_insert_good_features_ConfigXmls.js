#!/usr/bin/env node
"use strict";

console.log("- running hook script: " + __filename);

var fs = require("fs-extra");

var GOOD_CONFIGXMLS = [
    "./platforms/ios/GDEnableNew/config.xml"
    ];

function regexReplace(content, regex, replacement) {
    var matches = content.match(regex);
    if (matches !== null) {
        return content.replace(regex, replacement);
    } else {
        throw new Error("No match found for regex: " + rexeg);
    }
}

console.log("going to read file");

var goodFeatures = fs.readFileSync("./Good.SDK/GoodEnablementNew/iOS/config.xml", "utf8");
console.log("goodFeatures", goodFeatures);

GOOD_CONFIGXMLS.forEach(function(configFilename) {
    console.log("   reading config.xml file, configFilename: " + configFilename);
    var config = fs.readFileSync(configFilename, "utf8");

    console.log("   updating config.xml file");
    var regex = /(<\/widget>)/
    var replace = goodFeatures + '$1';
    config = regexReplace(config, regex, replace);

    console.log("   writing config.xml file");
    fs.writeFileSync(configFilename, config, 'utf8');
    console.log("   done writing config.xml file");

});

console.log("");


