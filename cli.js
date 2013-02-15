var argv = require("optimist").argv;
var lhc = require("./lib/lhc.js");

var algorithm = argv.algorithm || 'sha1';
var target = argv.target || argv._[0];
var limit = argv.limit;
var pre = argv.prefix || argv.pre || ""
var suf = argv.suffix || argv.suf
if(!suf) {
  if(argv.n) suf = ""
  else suf = "\n"
}

console.log(lhc.collide({
  algorithm: algorithm,
  target: target.toString(),
  limit: limit,
  pre: pre,
  suf: suf
}));
