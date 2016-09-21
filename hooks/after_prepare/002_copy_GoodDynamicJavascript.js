#!/usr/bin/env node
"use strict";

console.log("- running hook script: " + __filename);

var fs = require("fs-extra");

var src = "./Good.SDK/GoodPluginOriginal/Good_Dynamics_for_PhoneGap_v2.4.0.99/iOS/Source/GoodDynamics.js";
var dest = "./platforms/ios/www/GoodDynamics.js"
fs.copySync(src, dest);

//TODO: check if index.html references GoodDynamics.js

console.log("");


