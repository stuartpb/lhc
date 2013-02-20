"use strict";

var crypto = require("crypto");

function toHex(int){
  return int.toString(16);
}

function collide(opts){
  var target = opts.target;
  var targetLength = target.length;
  var algo = opts.algorithm;
  var limit = opts.limit || 65536;
  var prefix = opts.pre || "";
  var suf = opts.suf || "";
  var stringGen = opts.stringGen || toHex;

  //Calculates hash for random numbers from 0 to limit.
  //Returns number if hash found, or null if no hash found.
  function collider(pressure){
    var hash = crypto.createHash(algo);
    hash.update(prefix);
    hash.update(pressure);
    hash.update(suf);
    return hash.digest("hex").substring(0,targetLength) === target;
  }

  function nullCollide() {
    var hash = crypto.createHash(algo);
    hash.update(prefix);
    hash.update(suf);
    return hash.digest("hex").substring(0,targetLength) === target;
  }

  //Recursive collision function
  function collideRec(i, pressure, depth, diveTo){
    var branch = 0, result = null;
    if(depth < diveTo){
      while(branch < limit && !result){
        result = collideRec(
          branch,pressure+stringGen(i),depth+1,diveTo);
        branch++;
      }
      //If all the branches have been fully crawled with no hits,
      //and this is the root
      if(!result && depth == 0){
        ++i;
        //If there are yet more branches to launch from the root,
        if(i < limit){
          //launch the next branch
          return collideRec(i,pressure,depth,diveTo);
        //Otherwise, if this is the last of this level,
        } else {
          //Crawl the next depth level
          return collideRec(0, "", 0, diveTo+1);
        }
      }
      //If a match was found,
      //or there are still levels up to go
      else return result;
    } else
      //Evaluate for leaves
      return collider(pressure+stringGen(i)) ? pressure+stringGen(i) : false;
  }

  //Magic special null case!
  if(nullCollide()) return "";
  else return collideRec(0,"",0,1);
}

exports.collide = collide;
