"use strict";

var transformTools = require("browserify-transform-tools");

module.exports = transformTools.makeRequireTransform("requireTransform",
  {evaluateArguments: true},
  function(args, opts, cb) {
    if (args[0] === "csjs") {
      return cb(null, "require('csjs-injectify/csjs-inject')");
    } else {
      return cb();
    }
  }
);
