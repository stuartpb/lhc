var argv = require("optimist").argv;
var lhc = require("./lib/lhc.js");
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var queue = require('queue-async');

var target = argv.target || argv._[0];
var limit = argv.limit;
var pre = argv.prefix || argv.pre || "";
var suf = argv.suffix || argv.suf || "";
var author = argv.author;
var date = argv.date ? new Date(argv.date) : new Date();
var verbosity = argv.v;

var internaldate = Math.floor(date.valueOf()/1000).toString() + ' ' +
  (date.getTimezoneOffset()/-0.6).toString()
    .replace(/\d*$/,
      function(tzo){return "0000".substring(0, 4 - tzo.length) + tzo})
    .replace(/^./, function(fchar){return fchar == '-' ? '-' : '+' + fchar})

var env = process.env;
if(argv["git-dir"]) env.GIT_DIR = argv["git-dir"];

pre = pre.replace(/^\n*/,'');
suf = suf.replace(/\n*$/,'');

var q = queue();

q.defer(exec,'git config user.name',{env: env});
q.defer(exec,'git config user.email',{env: env});
q.defer(exec,'git write-tree',{env: env});
q.defer(exec,'git rev-parse HEAD',{env: env});
q.await(function(err,username, useremail, tree, parent){
  var committer = username.trim() + ' <' + useremail.trim() + '>';
  author = author || committer;
  var headpre =
    'tree ' + tree +
    'parent ' + parent +
    'author ' + author + ' ' + internaldate + '\n' +
    'committer ' + committer + ' ' + internaldate + '\n' +
    '\n' + pre

  var collision = null;
  var digits = 1;
  while (collision === null) {
    digits++;
    collision = lhc.collide({
      algorithm: 'sha1',
      target: target.toString(),
      limit: limit,
      length: digits,
      verbosity: verbosity,
      pre: 'commit ' +
        (headpre.length + digits+1 + suf.length + 1).toString(10) +
        '\x00' + headpre,
      suf: suf + '\n'
    })
  }

  env.GIT_AUTHOR_DATE = internaldate;
  env.GIT_COMMITTER_DATE = internaldate;

  var commit = spawn('git',
    ['commit','-m',pre+collision+suf],
    {env: env, stdio: 'inherit'})
})

