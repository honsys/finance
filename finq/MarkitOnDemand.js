#!/usr/bin/env node
//
// MarkitOnDemand realtime and delayed trade quotes (50 or hundred?)
// json return looks like:
//{ "Status": "SUCCESS", "Name": "Pengrowth Energy Corp", "Symbol": "PGH", "LastPrice": 6.28, "Change": -0.0199999999999996, "ChangePercent": -0.317460317460305, "Timestamp": "Wed Nov 27 09:54:00 UTC-05:00 2013", "MSDate": 41605.412500001, "MarketCap": 3268658360, "Volume": 500, "ChangeYTD": 4.97, "ChangePercentYTD": 26.3581488933602, "High": 6.28, "Low": 6.25, "Open": 6.25 }
//

var MarkitOnDemand = {}; // export this "namespace" object

MarkitOnDemand.path = function(stock) { return '/Api/v2/Quote/json?symbol=' + stock; }
MarkitOnDemand.URL = function(stock) { return 'http://' + MarkitOnDemand.host + MarkitOnDemand.path(stock); }

MarkitOnDemand.display = function(header, quote) {
  console.log(header);
  console.log(quote.Symbol+' '+quote.Change+' '+quote.LastPrice+' '+quote.Volume+' '+quote.Timestamp);
};

MarkitOnDemand.parser = function(res, body) {
  //console.log('transaction status code: ' + res.statusCode + ' size: ' + body.length);
  var header = 'MarkitOnDemand response header: ' + res.headers.date; // JSON.stringify(res.headers, null, 1);
  quote = JSON.parse(body);
  MarkitOnDemand.display(header, quote);
  quote = JSON.stringify(quote, null, 1);
  quote = quote.replace(/[\n\r]/g, ''); quote = quote.replace(/\}/g, ' }');
  return quote;
};

MarkitOnDemand.callback = function(err, res, body) {
  if( err || res.statusCode != 200) {
    return finq.errHandler(err, res, body);
  }
  var quote = MarkitOnDemand.parser(res, body);
  return MarkitOnDemand.resHandler('MarkitOnDemand', quote);
};

MarkitOnDemand.init = function(finq) {
  //MarkitOnDemand.prototype = finq;
  MarkitOnDemand.name = 'MarkitOnDemand'; // reset name
  MarkitOnDemand.host = 'dev.markitondemand.com';
  MarkitOnDemand.url = MarkitOnDemand.URL(finq.stock);
  MarkitOnDemand.errHandler = finq.errHandler;
  MarkitOnDemand.resHandler = finq.resHandler;
  // MarkitOnDemand.display = finq.display; // general purpose quote display
  console.log(MarkitOnDemand.name + ' -- ' + MarkitOnDemand.url);
  return MarkitOnDemand;
};

module.exports = MarkitOnDemand;
