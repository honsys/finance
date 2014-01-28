#!/usr/bin/env node;
//
// Yahoo realtime and delayed trade quotes (50 or hundred?)
var Yahoo = {}; // export this "namespace"
//
// realtime bats quote and order book
Yahoo.cheerio = require('cheerio');
Yahoo.path = function(stock) { return '/q/ecn?s=' + stock; }
Yahoo.URL = function(stock) { return 'http://' + Yahoo.host + Yahoo.path(stock); }

// cell elements paired (as of dec 2 2013) at indicated index:
// 26: 'Last Trade:' 27: '10.15'
// 28: 'Trade Time:' 29: '12:46PM EST'
// 30: 'Change:' 31: '0.13  (1.30%)'
// 32: 'Bid:' 33: '10.13 x200'
// 34: 'Ask:' 35: '10.15 x100'
Yahoo.parser = function(res, body) {
  //console.log('transaction status code: ' + res.statusCode); console.log(body);
  console.log('extract table cell <td> timestamp and trade value and volume elements');
  var header = res.headers.date; // JSON.stringify(res.headers, null, 1);
  var $ = Yahoo.cheerio.load(body);
  var trade = { 'chg': 0, 'val': 0, 'bid': 0, 'ask': 0,  'time': 0 }; 
  $('td').each(function(idx) {
    //console.log(idx + ': ' + $(this).text());
    if( idx == 27 ) trade.val = $(this).text();
    if( idx == 29 ) trade.time = $(this).text();
    if( idx == 31) trade.chg = $(this).text();
    if( idx == 33 ) trade.bid = $(this).text();
    if( idx == 35 ) trade.ask = $(this).text();
  });
  var quote = JSON.stringify(trade, null, 1);
  // quote = quote.replace(/\\n+|\\t+|\\r+|\s+/gm, '');
  quote = quote.replace(/\n+|\t+|\r+|\s+/gm, '');
  Yahoo.display(header, quote);
  return quote;
};

Yahoo.callback = function(err, res, body) {
  if( err || res.statusCode != 200) {
    return finq.errHandler(err, res, body);
  }
  var quote = Yahoo.parser(res, body);
  return Yahoo.resHandler('Yahoo', quote);
};

Yahoo.init = function(finq) {
  //Yahoo.prototype = finq;
  Yahoo.name = 'Yahoo'; // reset name
  Yahoo.host = 'finance.yahoo.com';
  Yahoo.url = Yahoo.URL(finq.stock);
  Yahoo.errHandler = finq.errHandler;
  Yahoo.resHandler = finq.resHandler;
  Yahoo.display = finq.display; // general purpose quote display
  console.log(Yahoo.name + ' -- ' + Yahoo.url);
  return Yahoo;
};

module.exports = Yahoo;
