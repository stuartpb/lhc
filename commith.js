var argv = require("optimist").argv;
var lhc = require("./lib/lhc.js");
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var queue = require('queue-async');
var fs = require('fs');

var target = argv.target || argv._[0];
var limit = argv.limit;
var pre = argv.prefix || argv.pre || "";
var suf = argv.suffix || argv.suf || "";
var author = argv.author;
var date = argv.date ? new Date(argv.date) : new Date();
var verbosity = argv.v;
var mindepth = argv.min || 1;

var internaldate = Math.floor(date.valueOf()/1000).toString() + ' ' +
  (date.getTimezoneOffset()/-0.6).toString()
    .replace(/\d*$/,
      function(tzo){return "0000".substring(0, 4 - tzo.length) + tzo})
    .replace(/^./, function(fchar){return fchar == '-' ? '-' : '+' + fchar})

var env = process.env;
if(argv["git-dir"]) env.GIT_DIR = argv["git-dir"];

var symbolsets = {
  bin: '01',
  dec: '0123456789',
  hex: '0123456789abcdef',
  hexcaps: '0123456789ABCDEF'
}

var symbols, sep;

if(argv.sep !== undefined) sep = argv.sep.toString();

if(argv.symbols) {
  if(symbolsets[argv.symbols]) {
    symbols = symbolsets[argv.symbols].split('')
    if(!sep && sep !== '') sep = '';
  } else {
    symbols = fs.readFileSync(argv).toString().trim().split("\n");
    if(!sep && sep !== '') sep = ' ';
  }
} else {
  sep = sep || '';
  symbols = symbolsets.hex.split('');
}

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
    '\n' + pre;
  var footsuf = suf + '\n';

  var hash = lhc.collider('sha1',target)

  var attempts = 0;
  function hashcommit(arr) {
    var pivot = arr.map(function(val){return symbols[val]}).join(sep)
    var commit = headpre + pivot + footsuf;
    ++attempts;
    if(verbosity && attempts % verbosity == 0) console.log(pivot);
    if(hash('commit '+commit.length.toString(10)+'\x00'+commit))
      return pre+pivot+suf;
    else return null;
  }

  var message = lhc.ploop(hashcommit,symbols.length,mindepth, limit);

  env.GIT_AUTHOR_DATE = internaldate;
  env.GIT_COMMITTER_DATE = internaldate;

  var commit = spawn('git',
    ['commit','-m',message],
    {env: env, stdio: 'inherit'})
})

