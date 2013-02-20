"use strict";

var crypto = require("crypto");

function toHex(int){
  return int.toString(16);
}

function collide(opts){
  var target = opts.target;
  var targetLength = target.length;
  var algo = opts.algorithm;
  var limit = opts.limit || 16;
  var depthInit = opts.minlength;
  var maxDepth = opts.maxlength;
  var prefix = opts.pre || "";
  var suf = opts.suf || "";
  var stringGen = opts.stringGen || toHex;
  var verbosity = opts.verbosity;

  if(opts.length !== undefined) {
    if(depthInit === undefined) depthInit = opts.length;
    if(maxDepth === undefined) maxDepth = opts.length;
  } else {
    if(depthInit === undefined) depthInit = 0;
  }

  var hashAttempts = 0;

  //Calculates hash for random numbers from 0 to limit.
  //Returns number if hash found, or null if no hash found.
  function collider(pressure){
    var hash = crypto.createHash(algo);
    hash.update(prefix);
    hash.update(pressure);
    hash.update(suf);
    hashAttempts++;
    if(verbosity && hashAttempts % verbosity == 0) console.log(pressure);
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
          if(maxDepth !== undefined && diveTo+1 > maxDepth){
            //No matches found within the requested depth.
            return null;
          } else {
            //Crawl the next depth level
            return collideRec(0, "", 0, diveTo+1);
          }
        }
      }
      //If a match was found,
      //or there are still levels up to go
      else return result;
    } else
      //Evaluate for leaves
      return collider(pressure+stringGen(i)) ? pressure+stringGen(i) : false;
  }

  //If it's valid to test if the hash can be reached with no change, do that
  if(!depthInit && nullCollide()) return "";
  else return collideRec(0,"",0,depthInit);
}

exports.collide = collide;
