"use strict";

var crypto = require("crypto");

function toHex(int){
  return int.toString(16);
}

function collider(algorithm,target) {
  var targetLength = target.length;
  return function(content){
    var hash = crypto.createHash(algorithm);
    hash.update(content);
    return hash.digest("hex").substring(0,targetLength) === target;
  };
}
exports.collider = collider;

//positional loop
function ploop(cb,base,start,end) {
  var places = [];
  var retval = null;
  //If start is undefined, default 1
  //If start is 0, run the loop 0 times then skip to 1
  var depth = start || 1;
  if(end === undefined) end = Infinity;
  
  while(retval === null && depth <= end){
    for (var i = 0; i < depth; ++i) {
      places[i] = 0;
    }
    var level = depth-1;
    while(retval === null && places[0] < base){
      retval = cb(places);
      while(retval === null && places[level] < base){
        ++places[level];
        retval = cb(places);
      }
      while(retval === null && places[level] >= base && level > 0){
        places[level] = 0;
        ++places[--level];
      }
      level = depth-1;
    }
    depth++;
  }
  return retval;
}

exports.ploop = ploop;

function mapjoin(symbols,sep){
  sep = sep || '';
  return function(arr){
    return arr.map(function(val){return symbols[val]}).join(sep);
  };
}
