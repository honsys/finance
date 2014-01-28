#!/usr/bin/env node
//
// Google realtime quotes
var Google = {}; // export this "namespace" object

// note circular require -- Finq requires Google
//Google.finq = require('./Finq.js'); // evidently may have issues

//Google.name = 'Google'; // this.name ?
//Google.host = 'www.google.com';
//Google.log = Google.finq.log;
//Google.errHandler = Google.finq.errHandler;
//Google.resHandler = Google.finq.resHandler;
//Google.display = Google.finq.display; // general purpose quote display

Google.path = function(stock) { return '/finance/info?client=ig&q=' + stock; }
Google.URL = function(stock) { return 'http://' + Google.host + Google.path(stock); }
//Google.url = Google.URL(Google.finq.stock);

Google.display = function(header, quote) {
  Google.log(header);
  Google.log(quote.t + ' ' + quote.c + ' ' + quote.l_cur + ' ' + quote.lt);
}
 
Google.parser = function(res, body) {
  var header = res.headers.date; // JSON.stringify(res.headers, null, 1);
  var quote = body.slice(6, -3); //Google.log(quote);
  quote = JSON.parse(quote);
  Google.display(header, quote);
  quote = JSON.stringify(quote, null, 1);
  quote = quote.replace(/[\n\r]/g, ''); quote = quote.replace(/\}/g, ' }');
  return quote;
};

Google.callback = function(err, res, body) {
  //Google.log('transaction status code: ' + res.statusCode + ' size: ' + body.length);
  if( err || res.statusCode != 200) {
    return Google.errHandler(err, res, body);
  }
  var quote = Google.parser(res, body);
  return Google.resHandler('Google', quote);
};

Google.init = function(finq) {
  //Google.prototype = finq;
  Google.log = finq.log;
  //Google.name = 'Google'; // reset name
  Google.host = 'www.google.com';
  Google.url = Google.URL(finq.stock);
  Google.errHandler = finq.errHandler;
  Google.resHandler = finq.resHandler;
  Google.display = finq.display; // general purpose quote display
  Google.log(Google.url);
  return Google;
};

module.exports = Google;
