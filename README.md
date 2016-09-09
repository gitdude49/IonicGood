# README #

This repository contains a sample app where a problem with "GD Filetransfer" can be reproduced

## Notice ##
The Cordova in this repository contains a number of items that are normally not committed in a Git repository:
* files under: ./platorms/
* files under: ./plugins/

These folders/files are in the repository as the ios/platforms has been manually been modified for Good enablement (folowing description in: [How to Enable GD Manually For Cordova CLI - iOS](https://github.com/gitdude49/IonicGood/blob/master/Good.SDK/GoodEnablementNew/iOS/Cordova%20-%20iOS%20-%20CLI%20-%20GD%20Enable.pdf)

## How do I get set up? ##
* clone the repository
* update npm modules by performing a “npm install” in the root of the project
* run iOS app: cordova run ios —debug —device