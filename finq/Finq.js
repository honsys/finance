#!/usr/bin/env node
//
// Finq realtime and delayed trade quotes (50 or hundred?)
var Finq = {}; // namespace

//Finq.prototype = Object.prototype;

// Finq namespace globals
Finq.assert = require('assert'); // checks
Finq.path = require('path');
Finq.fs = require('fs'); // write parsed results to file-system cache
Finq.mkdirp = require('mkdirp');
Finq.req = require('request'); // handles redirects transparently
Finq.urlParse = require('url').parse;
//
Finq.name = 'Finq';
Finq.stock = 'VVUS';
Finq.newcache = 0;
Finq.maxcache = 1; // if <= 0 continue until market cob (4pm EST). 
//
Finq.months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec' ];
Finq.hist = { 'Google': [], 'Nasdaq': [], 'MarkitOnDemand': [], 'Yahoo': [] };

Finq.sources = {};
Finq.sources.google = require('./Google.js');
//Finq.sources.markit = require('./MarkitOnDemand.js');
//Finq.sources.yahoo = require('./Yahoo.js');
//Finq.sources.nasdaq = require('./Nasdaq.js');

// util funcs
//Finq.prototype.log = function(text) {
Finq.log = function(text) {
  var prefix = '';
  if( this.name ) { prefix += this.name; }
  if( this.caller ) { prefix += ' via ' + this.caller; }
  prefix += '> ';
  console.log(prefix+text);
}

Finq.cache = function(stock, source) {
  var info = {};
  var date = new Date(); // assumes correct system time (EST)!
  info.year = date.getFullYear();
  info.month = Finq.months[date.getMonth()];
  info.day = date.getDate(); info.day = (info.day < 10 ? "0" : "") + info.day;
  info.hour = date.getHours(); info.hour = (info.hour < 10 ? "0" : "") + info.hour;
  info.min = date.getMinutes(); info.min = (info.min < 10 ? "0" : "") + info.min;
  info.sec = date.getSeconds(); info.sec = (info.sec < 10 ? "0" : "") + info.sec;
  info.cob = 100*parseInt(info.hour) + parseInt(info.min);
  info.datetime = info.year+info.month+info.day+':'+info.hour+':'+info.min+':'+info.sec;
  info.path = './cache/' + stock + '/' + info.year + info.month + info.day + '/'; // + source + '/';
  info.file = source + stock + '.' + info.hour + '.' + info.min + '.' + info.sec;
  //Finq.log(info.datetime + ' ... ' + info.path + info.file);
  return info;
}

// handlers and/or callbacks
Finq.errHandler = function(err, res, body) {
  var header = JSON.stringify(res.headers, null, 1);
  Finq.log('failed transaction status code: '+res.statusCode);
  Finq.log('transaction header: '+header);
  Finq.log(err);   
  Finq.log(body);
  return res.statusCode;
};

Finq.display = function(header, quote) {
  if(quote instanceof Array) {
    Finq.log(header + ' -- ' + JSON.stringify(quote[0], null, 1));
  }
  else {
    Finq.log(header + ' -- ' + JSON.stringify(quote, null, 1));
  }
};
 
Finq.resHandler = function(srcname, quote) {
  quote = Finq.stock + ': '  + quote; // prefix sotck symbol to each quote
  var cache = Finq.cacheInfo = Finq.cache(Finq.stock, srcname);
  var srcnt = Object.keys(Finq.sources).length; // simple counter modulus for the (4) data sources
  var filename = cache.path + cache.file + '.json';
  Finq.hist[cache.datetime] = quote;
  //Finq.display(cache.datetime, quote);
  // write trade quote(s) to cache folder
  Finq.mkdirp(cache.path, function(err) {
    if( err ) {
      Finq.log('failed to find or create full path for cachefile: '+cache);
      //throw(err); Finq.trace('finq.mkdirp');
    }
    Finq.log(filename);
    //finq.fsfs.appendFile('message.txt', 'data to append', function (err) {
    Finq.fs.writeFile(filename, quote+'\n', function (err) {
      if( err ) {
        Finq.log('failed to write cachefile: '+filename);
        process.exit(0);
        // if (err) throw(err); Finq.trace('finq.fs.writeFile');
      }
      Finq.newcache = 1.0/srcnt + Finq.newcache; // increment to maxcache to terminate
      //for(var key in Finq.hist) { Finq.log(key + ' == ' + Finq.hist[key]); }
    });
  });
};

Finq.startHeartbeat = function(interval, source) {
  source.init(Finq);
  Finq.log(source.name + ' -- ' + source.url);
  Finq.req(source.url, source.callback);
  if( Finq.maxcache == 1 ) { // special case for single transaction -- no interval timer needed
    return;
  }
  setInterval((function() {
    if( Finq.maxcache > 0 && Finq.newcache >= Finq.maxcache) {
      Finq.log('all transactions have completed ' + Finq.newcache + ' / ' + Finq.maxcache + ' exit ...');
      process.exit(0);
    }
    // check for time > COB ~ 1601 (4:01pm EST)
    if( Finq.cacheInfo.cob > 1601 ) {
      Finq.log('market closed (time > 4:01pm EST) ' + Finq.cacheInfo.datetime + ' exit ...');
      //process.exit(0);
    }
    // another transaction
    Finq.req(source.url, source.callback);
    //Finq.log(Finq.newcache + ' / ' + Finq.maxcache + '... awaiting completion of all transactions ...');
  }), interval*1000); // 1000 millisec == 1 sec interval
};

Finq.main = function() {
  //Finq.log(process.argv); // always present: argv[0] == nodem && argv[1] == binexe filename
  var invoke = Finq.path.basename(process.argv[1]);
  // unit test main // Finq.log(process.argv);
  if( process.argv.length > 2 ) { Finq.stock = process.argv[2].toUpperCase(); }
  if( process.argv.length > 3 ) { Finq.maxcache = parseInt(process.argv[3]); }
  
  var interval = 10; // hearbeat interval in sec.
  Finq.log(Finq.name + ' Financial quotes realtime (latest trades) of: '+
              Finq.stock + ' for ' + Finq.maxcache + ' iterations.');

  if( invoke == 'yahoo' || invoke == 'google' || invoke == 'markit' || invoke == 'nasdaq' ) {
    var source = Finq.sources[invoke];
    Finq.startHeartbeat(interval, source); 
    return;
  } 
  // iterate over all data sources:
  for( var key in Finq.sources ) {
    var source = Finq.sources[key];
    Finq.log(source.name + ' -- ' + source.url);
    Finq.startHeartbeat(interval, source);
  }
};

Finq.main(); // test it via command-line

module.exports = Finq;
