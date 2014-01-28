#!/usr/bin/env node
//
// Nasdaq realtime and delayed trade quotes (50 or hundred?)
var Nasdaq = {}; // export this "namespace"

Nasdaq.cheerio = require('cheerio');
Nasdaq.path = function(stock) { return '/symbol/' + stock + '/time-sales?time=0'; }
Nasdaq.URL = function(stock) { return 'http://' + Nasdaq.host + Nasdaq.path(stock); }

Nasdaq.displayRange = function(idx0, idx, hist) {
 // print or display in some fashion the indicated sub-array
 for( var i = idx0; i <= idx && i < hist.length; ++i ) {
   var show = JSON.stringify(hist[i], null, 1);
   show = show.replace(/[\n\r]/g, ''); show = show.replace(/\}/g, ' }');
   console.log(show);
 };
};

Nasdaq.parser = function(res, body) {
  var header = res.headers.date; // JSON.stringify(res.headers, null, 1);
  console.log('Nasdaq response header: ' + header);
  var $ = Nasdaq.cheerio.load(body);
  var trade = {'time': 0, 'val': 0, 'vol': 0}; 
  var hist = [];
  var cnt = 0;
  console.log('extract table cell <td> timestamp and trade value and volume elements');
  $('td').each(function(idx) {
    if( idx > 3 && idx < 154 ) {
      //console.log(idx + ': ' + $(this).text());
      cnt = cnt + 1;
      if( cnt == 1 ) trade.time = $(this).text();
      if( cnt == 2 ) trade.val = $(this).text();
      if( cnt == 3 ) trade.vol = $(this).text();
      if( cnt >= 3 ) {
        cnt = 0;
        // hist.push({'time': trade.time, 'val': trade.val, 'vol': trade.vol});
        //hist.push(JSON.stringify(trade, null, 1).replace(/[\n\r]/g, '').replace(/\}/g, ' }'));
        hist.push(JSON.stringify(trade, null, 0).replace(/[\n\r]/g, ''));
      }
    }
  });
  Nasdaq.display(header, hist);
  return hist;
};

Nasdaq.callback = function(err, res, body) {
  //console.log('transaction status code: ' + res.statusCode);
  if( err || res.statusCode != 200) {
    return finq.errHandler(err, res, body);
  }
  //console.log(body);
  var quote = Nasdaq.parser(res, body);
  return Nasdaq.resHandler('Nasdaq', quote);
};

Nasdaq.init = function(finq) {
  //Nasdaq.prototype = finq;
  Nasdaq.name = 'Nasdaq';
  Nasdaq.host = 'www.nasdaq.com';
  Nasdaq.url = Nasdaq.URL(finq.stock);
  Nasdaq.errHandler = finq.errHandler;
  Nasdaq.resHandler = finq.resHandler;
  Nasdaq.display = finq.display; // general purpose quote display
  console.log(Nasdaq.name + ' -- ' + Nasdaq.url);
  return Nasdaq;
};

module.exports = Nasdaq;
