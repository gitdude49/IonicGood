#!/usr/bin/env node
"use strict";

var xcode = require('xcode');
var plist = require('plist');
var fs = require('fs-extra');

var APP_NAME = "GDEnableNew"
var APP_PACKAGE = "com.blaud.goodenablementnew";

var GD_APPLICATION_ID = "com.blaud.goodenablementnew";
var GD_APPLICATION_VERSION = "1.0.0.0";
var GD_LIBRARY_MODE = "GDEnterprise";

/*
Modify .plist
 */
var plistFilename = './platforms/ios/' + APP_NAME + '/' + APP_NAME + '-Info.plist';
var plistObj = plist.parse(fs.readFileSync(plistFilename, 'utf8'));


//TODO: this will replace existing 'CFBundleURLTypes', better check for existing (non-Good related) & add/modify our own CFBundleURLType(s)
plistObj.CFBundleURLTypes = [
    {
        CFBundleURLName: APP_PACKAGE,
        CFBundleURLSchemes: [
            APP_PACKAGE + '.sc2',
            APP_PACKAGE + '.sc',
            APP_PACKAGE + '.sc2.1.0.0.0',
            'com.good.gd.discovery'
        ]
    }
]

plistObj.GDApplicationID = GD_APPLICATION_ID;
plistObj.GDApplicationVersion = GD_APPLICATION_VERSION;
plistObj.GDLibraryMode = GD_LIBRARY_MODE;

//The Node plist module seems to have a problem with reading & writing back empty-string values
//In the Cordova generated plist there's two empty string values, we read 'm & when they are null, we set 'm back to "" (empty string)
if (plistObj.NSMainNibFile === null) {
    plistObj.NSMainNibFile = "";
}
if (plistObj["NSMainNibFile~ipad"] === null) {
    plistObj["NSMainNibFile~ipad"] = "";
}
if (plistObj["NSLocationWhenInUseUsageDescription"] === null) {
  plistObj["NSLocationWhenInUseUsageDescription"] = "";
}

fs.writeFileSync(plistFilename, plist.build(plistObj), "utf8");

/*
Copy GDApp files -> GD
 */
var GoodSDKMaterialsSourcePath = "./Good.SDK/GoodEnablementNew/iOS";
var GoodSDKMaterialsDestinationPath = "./platforms/ios/GD";

fs.copySync(GoodSDKMaterialsSourcePath + "/GD/GDApp.xcconfig", GoodSDKMaterialsDestinationPath + "/GDApp.xcconfig");
fs.copySync(GoodSDKMaterialsSourcePath + "/GD/GDAppDelegate.h", GoodSDKMaterialsDestinationPath + "/GDAppDelegate.h");
fs.copySync(GoodSDKMaterialsSourcePath + "/GD/GDAppDelegate.m", GoodSDKMaterialsDestinationPath + "/GDAppDelegate.m");


/*
Replace AppDelegate (on filesystem)
//TODO: instead of replacing whole files we better might apply a patch file (while checking of our patch is still valid/supported)
 */
var GoodSDKMaterialsCustomSourcePath = "./Good.SDK/custom";
var GoodSDKMaterialsCustomDestinationPath = "./platforms/ios/" + APP_NAME + "/Classes";

fs.copySync(GoodSDKMaterialsCustomSourcePath + "/AppDelegate.h", GoodSDKMaterialsCustomDestinationPath + "/AppDelegate.h");
fs.copySync(GoodSDKMaterialsCustomSourcePath + "/AppDelegate.m", GoodSDKMaterialsCustomDestinationPath + "/AppDelegate.m");


/*
Copy GDCordova.framework to iOS project
 */
var src = "/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk/System/Library/Frameworks/GDCordova.framework";
var dest = "./platforms/ios/GDCordova.framework"
fs.copySync(src, dest);

/*
Modify the .xcodeproj (project.pbxproj)
 */
var projectPath = 'platforms/ios/' + APP_NAME +'.xcodeproj/project.pbxproj';
var project = xcode.project(projectPath);

project.parse(function (err) {
    var gdGroup = project.findPBXGroupKey({path: 'GD'});
    var rootGroup = project.findPBXGroupKey({name: 'CustomTemplate'});

    console.log('gdGroup', gdGroup);
    console.log('rootGroup', rootGroup);

    if (gdGroup) {
        //clean up existing GD group
        project.removeHeaderFile("GD/GDAppDelegate.h", {}, gdGroup);
        project.removeSourceFile("GD/GDAppDelegate.m", {}, gdGroup);
        project.removeResourceFile("GD/GDApp.xcconfig", {}, gdGroup);
        project.removeFile("GD/GDAssets.bundle", gdGroup, {});

        console.log('gdGroup', gdGroup);

        project.removeFromPbxGroup(gdGroup, rootGroup);

        project.removePbxGroup(gdGroup);
    }

    //Create GD group
    gdGroup = project.pbxCreateGroup('GD', 'GD');
    console.log('new gdGroup', gdGroup);

    //Add resources to GD group
    project.addHeaderFile('GDAppDelegate.h', {}, gdGroup);
    project.addSourceFile('GDAppDelegate.m', {}, gdGroup);
    project.addResourceFile('GDApp.xcconfig', {}, gdGroup);
    //project.addResourceFile('GDApp.xcconfig', {}, gdGroup);

    //Add GD group to project
    project.addToPbxGroup(gdGroup, rootGroup);

    //Add linked libraries
    /*
    The frameworks below are already linked by Cordova
     // AssetsLibrary.framework
     // libCordova.a
     // CoreGraphics.framework
     // MobileCoreServices.framework
     */
    project.addFramework('SystemConfiguration.framework');
    project.addFramework('CoreTelephony.framework');
    project.addFramework('GD.framework');
    project.addFramework('MessageUI.framework');
    project.addFramework('QuartzCore.framework');
    project.addFramework('QuickLook.framework');
    project.addFramework('CFNetwork.framework');
    project.addFramework('Security.framework');
    project.addFramework('AdSupport.framework');
    project.addFramework('CoreData.framework');
    project.addFramework('LocalAuthentication.framework');
    project.addFramework('libz.tbd');
    project.addFramework('libstdc++.6.tbd');
    project.addFramework('CoreGraphics.framework');

    //Add GDCordova.framework to frameworks
    project.addFramework(
        "GDCordova.framework",
        {
            customFramework: true,
            link: true
        }
    );

    //Add GDAssets.bundle (GD.framework) to our new GD group
    project.addFile(
        '/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk/System/Library/Frameworks/GD.framework/Versions/A/Resources/GDAssets.bundle',
        gdGroup,
        {}
    );

    //Write the modified .xcodeproj (project.pbxproj)
    fs.writeFileSync(projectPath, project.writeSync());

});

console.log("");
console.log("Remember:");
console.log("- Start xcode and set Configurations Debug and Release to'GDApp'");
console.log("- Make sure the Cordova project has an hook (after prepare) to insert good features in 'platforms/ios/<projectname>/config.xml'");


