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
  /*function collider(pressure){
    var i = 0;
    var hash, result="";
    while(result.substring(0,targetLength)!==target && i < limit){
      hash = crypto.createHash(algo);
      hash.update(prefix);
      hash.update(pressure);
      hash.update(stringGen(i));
      hash.update(suf);
      result = hash.digest("hex");
      ++i;
    }
    if(result.substring(0,targetLength)===target)
      return i-1;
    else
      return null;
  }
  
  function nullCollide() {
    hash = crypto.createHash(algo);
    hash.update(prefix);
    hash.update(suf);
    return hash.digest("hex").substring(0,targetLength) === target;
  }*/
  
  function nullCollide() {
    return target == "";
  }
  
  function collider(pressure){
    var i = 0;
    var result="";

    while(result.substring(0,targetLength)!==target && i < limit){
      result = prefix+pressure+stringGen(i)+suf;
      ++i;
    }
    if(result.substring(0,targetLength)===target)
      return i-1;
    else
      return null;
  }
  
  function collideRec(i, pressure, depth, diveTo){
    var branch = 0, result = null;
    if(depth < diveTo){
      while(branch < limit && result === null){
        result = collideRec(
          branch,pressure+stringGen(i),depth+1,diveTo);
        branch++;
      }
      //If there were no results, all the branches have been fully crawled,
      //and this is the root
      if(result===null && depth == 0){
        ++i;
        if(i < limit){
          return collideRec(i,pressure,depth,diveTo); 
        } else {
          return collideRec(
            //The pressure chain resets. This is weird, but right.
            0, "", 0, diveTo+1);
        }
      }
      //Return null if the loop ended without any different result,
      //or the non-null result if it did
      else return result;
    } else {
      result = collider(pressure);
      if(result!==null) {
        return pressure+stringGen(result);
      } else {
        //This branch did nothing.
        //Return back up so the next branch will be done.
        return null;
      }
    }
  }
  
  //Magic special null case!
  if(nullCollide()) return "";
  else return collideRec(0,"",0,1);
}

exports.collide = collide;