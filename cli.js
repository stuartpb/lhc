var argv = require("optimist").argv;
var lhc = require("./lib/lhc.js");

console.log(lhc.collide({target:"23145",limit:10}));