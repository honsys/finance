#!/usr/bin/env node

// globals:
_fs = require('fs'); 
_http = require('http');

//var _forex = { "USD" : 1.0 }; // base is u.s. dollar
_forex = ''; // response buffer (which should be json)

//var _currnames = { "USD" : "United States Dollar" }; // base is u.s. dollar
_currnames = ''; // response buffer (which should be json)

_jdate = (new Date()).toJSON();
_log2stdout = false;

_currlist = 'http://openexchangerates.org/api/currencies.json'; // no apid needed?
_quote = 'http://openexchangerates.org/api/latest.json?app_id=a3aef6b27057437da448f3322a3b660e';
_history = 'http://openexchangerates.org/api/historical/2011-10-18.json?app_id=a3aef6b27057437da448f3322a3b660e';

var _exit = false;

if( _log2stdout ) {
  console.log('nodejs: ' + process.version);
  console.log('according to this reference from: https://openexchangerates.org/quick-start ... using url and appId:');
  console.log(_quote); 
}

var applyRates = function(rates) {
  console.log('--------------------------------------------------------------------------------------');
  console.log(_jdate + ': ' + _currnames.CAD + ' == ' + rates.CAD + ' USA dollars.');
  console.log(_jdate + ": 1 " + _currnames.CAD + " dividend yields " + 1.0/rates.CAD + " US dollars.");
  console.log('--------------------------------------------------------------------------------------');
  console.log(_jdate + ': ' + _currnames.GBP + ' == ' + rates.GBP + ' USA dollars.');
  console.log(_jdate + ": 1 " + _currnames.GBP + " dividend yields " + 1.0/rates.GBP + " US dollars.");
  console.log('--------------------------------------------------------------------------------------');
  if( _log2stdout ) {
    console.log(rates);
  }
  _exit = true;
};

var handleRates = function(filename) {
  var dt = _jdate = (new Date()).toJSON();
  var savefile = filename + dt + '.json';
  _fs.writeFile(savefile, _forex, function(err) {
    if( err ) { return console.log(err); }
    //_forex = require(savefile); // this is (potentially) blocking i/o, but provides cache-file validation
    _forex = JSON.parse(_forex); // this avoids the above cache-file-i/o 
    // this blocks: _forex = require(savefile); // is this needed? _forex = JSON.parse(_forex);
    if( _log2stdout ) { 
      console.log('reply: \n' + _forex.disclaimer + '\n' + _forex.base); // console.log(_forex.rates);
    }
    applyRates(_forex.rates);
  });
};

var getLatestRates = function() {
 _http.get(_quote, function(res) {
  //console.log("response: " + res.statusCode);
  res.setEncoding('utf8');
  res.on('end', function(content) { handleRates('./quote_forex'); });
  res.on('data', function(content) { _forex += content; }); // buffer full quote
  }).on('error', function(err) { console.log("http.get latest exchange rates error: " + err.message); });
};

var handleCurrNames = function(filename) {
  var dt = _jdate = (new Date()).toJSON();
  var savefile = filename + dt + '.json';
  _fs.writeFile(savefile, _currnames, function(err) {
    if( err ) { return console.log(err); }
    //_currnames = require(savefile); // this is (potentially) blocking i/o, but provides cache-file validation
    _currnames = JSON.parse(_currnames); // this avoids the above cache-file-i/o 
    // now get the latest/current rates:
    getLatestRates();
    // this blocks: _forex = require(savefile); // is this needed? _forex = JSON.parse(_forex);
    if( _log2stdout ) {
      console.log(_currnames);
    }
  });
};

var startForex = function() {
  // first fect list of currency names. and upon successful completion of 
  // first transaction, handler should proceed with rates query...
  _http.get(_currlist, function(res) {
  //console.log("response: " + res.statusCode);
  res.setEncoding('utf8');
  res.on('end', function(content) { handleCurrNames('./currencies.json'); });
  res.on('data', function(content) { _currnames += content; }); // buffer full list
  }).on('error', function(err) { console.log("http.get currencies list error: " + err.message); });
};

var startHeartbeat = function() {
  setInterval((function() {
    if( _exit ) {
      console.log('all transactions have completed, exit ...');
      process.exit(0);
    }
    console.log('... awaiting completion of all transactions ...');
  }), 500); // 500 millisec == 0.5 sec interval
};

var main = function() {
  console.log('nodejs: ' + process.version);
  startHeartbeat();
  startForex();
};

main();
