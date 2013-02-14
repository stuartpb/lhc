var argv = require("optimist").argv;
var lhc = require("./lib/lhc.js");

var algorithm = argv.algorithm || 'sha1';
var target = argv.target || argv._[0];
//Not honestly sure it's a great idea to parameterize this, but...
var limit = argv.limit;

console.log(lhc.collide({
  algo: algorithm,
  target: target,
  limit: limit
}));