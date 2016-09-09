# README #

This repository contains a sample app where a problem with "GD Filetransfer" can be reproduced

## Some specials about this project/repository ##

**Folders/files you will normally not find in GIT**
The Cordova in this repository contains a number of items that are normally not committed to a Git repository:

* files under: ./platorms/
* files under: ./plugins/

**Some Cordova hooks have been added:**

*./hooks/after_prepare/001_insert_good_features_ConfigXmls.js*

This hook (re)inserts the GD features in "./platforms/ios/GDEnableNew/config.xml" (The GD features are deleted from the config.xml by Cordova in the prepare phase)

*./hooks/after_prepare/002_copy_GoodDynamicJavascript.js*

This hook copies the GoodDynamics.js to "./platforms/ios/www/GoodDynamics.js" (This file is removed by Cordova in the prepare phase)

These folders/files are in the repository as the ios/platforms has been manually been modified for Good enablement (folowing description in: [How to Enable GD Manually For Cordova CLI - iOS](https://github.com/gitdude49/IonicGood/blob/master/Good.SDK/GoodEnablementNew/iOS/Cordova%20-%20iOS%20-%20CLI%20-%20GD%20Enable.pdf)

## How do I get set up? ##
* clone the repository
* update npm modules by performing a “npm install” in the root of the project
* run iOS app: cordova run ios —debug —device