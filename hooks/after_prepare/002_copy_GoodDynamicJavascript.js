#!/usr/bin/env node
"use strict";

console.log("- running hook script: " + __filename);

var fs = require("fs-extra");

var src = "./Good.SDK/GoodPluginOriginal/GoodDynamics.js";
var dest = "./platforms/ios/www/GoodDynamics.js"
fs.copySync(src, dest);

//TODO: check if index.html references GoodDynamics.js

console.log("");


