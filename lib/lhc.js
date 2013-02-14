var crypto = require("crypto");

function toHex(int){
  return int.toString(16);   
}

//Calculates hash for random numbers from 0 to limit.
//Returns number if hash found, or null if no hash found.
/*function collider(target,algo,limit,pre,suf,stringGen){
  var targetLength = target.length;
  var i = 0;
  var hash, result="";
  while(result.substring(0,targetLength)!==target && i < limit){
    hash = crypto.createHash(algo);
    hash.update(pre);
    hash.update(stringGen(i));
    hash.update(suf);
    result = hash.digest("hex");
    ++i;
  }
  if(result.substring(0,targetLength)===target)
    return i;
  else
    return null;
}*/

function collider(target,algo,limit,pre,suf,stringGen){
  var targetLength = target.length;
  var i = 0;
  var result="";
  while(result.substring(0,targetLength)!==target && i < limit){
    result = pre+stringGen(i)+suf;
    console.log("> ",target,pre,i);
    ++i;
  }
  if(result.substring(0,targetLength)===target)
    return i;
  else
    return null;
}

function collideRec(target,algo,limit,pre,suf,stringGen,
  i, pressure, depth, diveTo){
  console.log(target,limit,pre,i,pressure,depth,diveTo);
  var branch = 0, result = null;
  if(depth < diveTo){
    while(branch < limit && result === null){
      result = collideRec(target,algo,limit,pre,suf,stringGen,
        branch,pressure+stringGen(i),depth+1,diveTo);
      branch++;
    }
    //Return null if the loop ended without any different result,
    //or the non-null result if it did
    return result;
  } else {
    result = collider(target,algo,limit,pre+pressure,suf,stringGen);
    if(result!==null) {
      return pressure+stringGen(result);
    } else {
      if ( i < limit ) {
        //This branch did nothing.
        //Return back up so the next branch will be done.
        return null;
      } else {
        return collideRec(target,algo,limit,pre,suf,stringGen,
          //The pressure chain resets. This is weird, but right.
          0, "", 1, diveTo+1);
      }
    }
  }
}

function collide(opts){
  var target = opts.target;
  var algo = opts.algorithm;
  var limit = opts.limit || 65536;
  var pre = opts.pre || "";
  var suf = opts.suf || "";
  var stringGen = opts.stringGen || toHex;
  return collideRec(target,algo,limit,pre,suf,stringGen,0,"",0,0);
}

exports.collide = collide;