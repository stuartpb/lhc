"use strict";

var argv = require("optimist").argv;
var lhc = require("./lib/lhc.js");

var algorithm = argv.algorithm || 'sha1';
var target = argv.target || argv._[0];
var limit = argv.limit;
var pre = argv.prefix || argv.pre || "";
var suf = argv.suffix || argv.suf || "";
var verbosity = argv.v;

var mindepth = argv.min || 1;

var symbolsets = {
  '':{
      bin: '01',
      dec: '0123456789',
      hex: '0123456789abcdef',
      hexcaps: '0123456789ABCDEF'
  },
  ' ':{
    nato: 'Alpha Bravo Charlie Delta Echo Foxtrot ' +
      'Golf Hotel India Juliet Kilo Lima Mike November ' +
      'Oscar Papa Quebec Romeo Sierra Tango Uniform ' +
      'Victor X-ray Yankee Zulu'
  }
}

var symbols, sep;

if(argv.sep !== undefined) sep = argv.sep.toString();

if(argv.symbols) {
  for (setsep in symbolsets) {
    for (set in symbolsets[setsep]) {
      if(set == argv.symbols) {
        symbols = symbolsets[setsep][set].split(setsep)
        if(!sep && sep !== '') sep = setsep;
      }
    }
  }
  if(!symbols) {
    symbols = fs.readFileSync(argv).toString().trim().split("\n");
    if(!sep && sep !== '') sep = ' ';
  }
} else {
  sep = sep || '';
  symbols = symbolsets[''].hex.split('');
}

var hash = lhc.collider(algorithm,target);
var attempts = 0;

function basictester(arr) {
  var pivot = pre + arr.map(
    function(val){return symbols[val]})
    .join(sep) + suf;
  ++attempts;
  if(verbosity && attempts % verbosity == 0) console.log(pivot);
  if(hash(pivot)) return pivot; else return null;
}

console.log(lhc.ploop(basictester,symbols.length,mindepth,limit)
  || 'Limit reached before finding collision');
