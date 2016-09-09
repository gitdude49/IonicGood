"use strict";

var childProcess = require('child_process');
var fs = require('../../node_modules/fs-extra');
var xml2js = require('../../node_modules/xml2js');

var GOOD_SDK_ENABLED_FILE = "./platforms/android/MIA_GOOD_SDK_IS_ENABLED";

var PLATFORM_ANDROID_FOLDER = "./platforms/android/";

var CORDOVA_CONFIGFILE = "config.xml";

var PLATFORM_ANDROID = "android";
var PLATFORM_IOS = "ios";

var DIST_DIR = "./dist";

function exec(description, commandline, workingdir, callback) {
    //console.log("   buildfunctions.exec, description: " + description + ", commandline: " + commandline + ", workingdir: " + workingdir);
    childProcess.exec(
        commandline,
        {
            cwd: workingdir,
            maxBuffer: 1024*1024
        },
        function (err) {
            //console.log("   buildfunctions.exec, return from childProcess.exec, err: " + err, err);
            if (err !== null)
                throw new Error(description + ' failed, err.message: ' + err.message);
            callback();
        }
    ).stdout.pipe(process.stdout);
};

function execSync(description, commandline, workingdir) {
    //console.log("   buildfunctions.execSync, description: " + description + ", commandline: " + commandline + ", workingdir: " + workingdir);
    try {
        childProcess.execSync(
            commandline,
            {
                cwd: workingdir,
                maxBuffer: 1024*1024,
                stdio:[0,1,2]
            }
        );
    } catch(err) {
        console.log("   buildfunctions.execSync, caught, err: " + err, err);
        throw err
    }
};

/*
Gets the Cordava configuration information:
- app name
- version number
- content src
 */
function getCordovaNameAndVersionNumber(configFile, callback) {
    var parser = new xml2js.Parser();
    fs.readFile(configFile, function(err, data) {
        if (err)
            callback(err);

        parser.parseString(data, function (err, result) {
            if (err)
                callback(err);

            var versionNumber;
            var name;
            var contentSrc;

            if (result && result.widget && result.widget.$ && result.widget.$.version) {
                versionNumber = result.widget.$.version;
            } else {
                callback("failed to get the cordova version number from '" + configFile + "'");
            }


            if (result && result.widget && result.widget.name instanceof Array && result.widget.name.length === 1) {
                name = result.widget.name[0];
            } else {
                callback("failed to get the cordova name from '" + configFile + "'");
            }

            if (result && result.widget && result.widget.content instanceof Array && result.widget.content.length === 1) {
                var temp = result.widget.content[0];
                if (temp.$ && temp.$.src) {
                    contentSrc = temp.$.src;
                } else {
                    callback("failed to get the cordova content.src from '" + configFile + "'");
                }
            } else {
                callback("failed to get the cordova content.src from '" + configFile + "'");
            }

            callback(null, name, versionNumber, contentSrc);

        });
    });
}

function isCordovaContentLocal(callback) {
    getCordovaNameAndVersionNumber(CORDOVA_CONFIGFILE, function (err, appName, appVersion, contentSrc) {

        if (err)
            callback(err);

        var isLocal = (contentSrc === "index.html");

        callback(null, isLocal);
    });
}

function regexReplace(content, regex, replacement) {
    var matches = content.match(regex);
    if (matches !== null) {
        return content.replace(regex, replacement);
    } else {
        throw new Error("No match found for regex: " + rexeg);
    }
}

function setConfigXMLPackageIdAndApplicationname(packageId, applicationName) {
    if (fs.existsSync(CORDOVA_CONFIGFILE)) {
        var config = fs.readFileSync(CORDOVA_CONFIGFILE, "utf8");

        //regular expression for version code
        var regex = /(<widget.*?id=").*?(")/
        var replace = '$1' + packageId + '$2';
        config = regexReplace(config, regex, replace);

        //regular expression for content src
        regex = /(<name>).*?(<\/name>)/
        replace = '$1' + applicationName + '$2';
        config = regexReplace(config, regex, replace);

        //console.log("config: " + config);
        fs.writeFileSync(CORDOVA_CONFIGFILE, config, 'utf8');
    } else {
        throw new Error("Error: Cordova config file not found: '" + CORDOVA_CONFIGFILE + "'")
    }
}

function isAndroidBuild() {
    return (process.env.CORDOVA_PLATFORMS.indexOf("android") !== -1)
}

function isIosBuild() {
    return (process.env.CORDOVA_PLATFORMS.indexOf("ios") !== -1)
}

function isReleaseBuild() {
    var commandline = process.env.CORDOVA_CMDLINE;
    return (commandline.indexOf("--release") !== -1);
}

function isTargetDeviceBuild() {
    var commandline = process.env.CORDOVA_CMDLINE;
    return (commandline.indexOf("--device") !== -1);
}

function isRun() {
    var commandline = process.env.CORDOVA_CMDLINE;
    return (commandline.indexOf(" run ") !== -1);
}

function setGoodEnabled(enabled) {
    if (enabled) {
        fs.writeFileSync(GOOD_SDK_ENABLED_FILE, "This files acts as an indicator for the platform to be Good SDK enabled. It has been created from the build_functions", 'utf8');
    } else {
        if (fs.existsSync(GOOD_SDK_ENABLED_FILE)) {
            fs.removeSync(GOOD_SDK_ENABLED_FILE);
        }
    }
}

function isGoodEnabled() {
    return fs.existsSync(GOOD_SDK_ENABLED_FILE);
}

function saveEditionToPlatform(edition, platform) {
    var file = "./platforms/" + platform + "/MIA_edition.json";
    fs.writeJSONSync(file, edition);
}

function loadEditionFromPlatform(platform) {
    var file = "./platforms/" + platform + "/MIA_edition.json";
    if (fs.existsSync(file)) {
        return fs.readJSONSync(file);
    } else {
        return;
    }
}

module.exports.GOOD_SDK_ENABLED_FILE = GOOD_SDK_ENABLED_FILE;

module.exports.PLATFORM_ANDROID_FOLDER = PLATFORM_ANDROID_FOLDER;

module.exports.CORDOVA_CONFIGFILE = CORDOVA_CONFIGFILE;

module.exports.PLATFORM_ANDROID = PLATFORM_ANDROID;
module.exports.PLATFORM_IOS = PLATFORM_IOS;

module.exports.DIST_DIR = DIST_DIR;

module.exports.exec = exec;
module.exports.execSync = execSync;
module.exports.getCordovaNameAndVersionNumber = getCordovaNameAndVersionNumber;
module.exports.isCordovaContentLocal = isCordovaContentLocal;
module.exports.regexReplace = regexReplace;
module.exports.setConfigXMLPackageIdAndApplicationname = setConfigXMLPackageIdAndApplicationname;
module.exports.isAndroidBuild = isAndroidBuild;
module.exports.isIosBuild = isIosBuild;
module.exports.isReleaseBuild = isReleaseBuild;
module.exports.isTargetDeviceBuild = isTargetDeviceBuild;
module.exports.isRun = isRun;
module.exports.setGoodEnabled = setGoodEnabled;
module.exports.isGoodEnabled = isGoodEnabled;
module.exports.saveEditionToPlatform = saveEditionToPlatform;
module.exports.loadEditionFromPlatform = loadEditionFromPlatform;
