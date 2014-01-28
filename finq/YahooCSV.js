#!/usr/bin/env node;
//
// Yahoo realtime and delayed trade quotes (50 or hundred?)
var Yahoo = {}; // export this "namespace"

Yahoo.name = 'Yahoo';
Yahoo.host = 'download.finance.yahoo.com';
//
// consider Yahoo.qREST table of known REST query params (below) ...
//
//Yahoo.format = 'change (c1), realtime with time (k1), delayed (~15min) last trade (l1) and date (d1) and time(t1),
// realtime with time (k1), realtime bid (b3), realtime ask (b2), realtime order book (i5)';  
// Yahoo.format = 'f=c1k1l1d1t1b3b2i5'
//
// Yahoo.format = 'change (c1), delayed (~15min) last trade (l1) and date (d1) and time(t1), realtime with time (k1),
// realtime bid (b3), realtime ask (b2)';  
//

Yahoo.qREST = {}; Yahoo.iqREST = {};
Yahoo.format = function() {
  Yahoo.formatList = [ 'c1', 'l1', 'd1', 't1', 'b3', 'b2' ]; // default format
  if( Object.keys(Yahoo.qREST).length === 0 ) { Yahoo.init(); }
  return Yahoo.formatList.join(); // 'f=c1l1d1t1b3b2';
}
Yahoo.path = function(stock) { return '/d/quotes.csv?s=' + stock + '&f=' + Yahoo.format(); }
Yahoo.URL = function(stock) { return 'http://' + Yahoo.host + Yahoo.path(stock); }

Yahoo.parser = function(res, body) {
  // parse csv 
  // console.log('transaction status code: ' + res.statusCode + ' size: ' + body.length);
  console.log('Yahoo response body: ' + body);
  var quote = body.split(','); // console.log(quote);
  var hash = {};
  //for( var i = 0; i < quote.length; ++i ) {
  for( var i = 0; i < Yahoo.formatList.length; ++i ) {
    var item = Yahoo.formatList[i];
    var key = Yahoo.iqREST[item];
    console.log(key + ' (' + item + ') == ' + quote[i]);
    hash[key] = quote[i];
  }
  return quote;
};

Yahoo.callback = function(err, res, body) {
  if( err || res.statusCode != 200) {
    return finq.errHandler(err, res, body);
  }
  var header = JSON.stringify(res.headers, null, 1);
  console.log('Yahoo response header: ' + header);
  var quote = Yahoo.parser(res, body);
  return Yahoo.resHandler('Yahoo', quote);
};

Yahoo.transact = function(finq) { 
  var url = Yahoo.URL(finq.stock);
  Yahoo.resHandler = finq.resHandler; // general purpose response handler
  finq.req(url, Yahoo.callback); // rest-query request callback
}

// yahoo rest params from https://code.google.com/p/yahoo-finance-managed/wiki/enumQuoteProperty
// also (with some history and more): http://www.gummy-stuff.org/Yahoo-data.htm
Yahoo.init = function() {
  Yahoo.qREST.AfterHoursChangeRealtime = 'c8';
  Yahoo.qREST.AnnualizedGain = 'g3';
  Yahoo.qREST.AnnualizedGain = 'g3';
  Yahoo.qREST.Ask = 'a0';
  Yahoo.qREST.AskRealtime = 'b2';
  Yahoo.qREST.AskSize = 'a5';
  Yahoo.qREST.AvgDailyVolume = 'a2';
  Yahoo.qREST.Bid = 'b0';
  Yahoo.qREST.BidRealtime = 'b3';
  Yahoo.qREST.BidSize = 'b6';
  Yahoo.qREST.BookValPerShare = 'b4';
  Yahoo.qREST.Change = 'c1';
  Yahoo.qREST.ChangeInPercent = 'c0';
  Yahoo.qREST.ChangeFromFiftydayMovingAvg = 'm7';
  Yahoo.qREST.ChangeFromTwoHundreddayMovingAvg = 'm5';
  Yahoo.qREST.ChangeFromYearHigh = 'k4';
  Yahoo.qREST.ChangeFromYearLow = 'j5';
  Yahoo.qREST.ChangeInPercent = 'p2';
  Yahoo.qREST.ChangeInPercentRealtime = 'k2';
  Yahoo.qREST.ChangeRealtime = 'c6';
  Yahoo.qREST.Commission = 'c3';
  Yahoo.qREST.Currency = 'c4';
  Yahoo.qREST.DayHigh = 'h0';
  Yahoo.qREST.DayLow = 'g0';
  Yahoo.qREST.DayRange = 'm0';
  Yahoo.qREST.DayRangeRealtime = 'm2';
  Yahoo.qREST.DayValueChange = 'w1';
  Yahoo.qREST.DayValueChangeRealtime = 'w4';
  Yahoo.qREST.DividendPayDate= 'r1';
  Yahoo.qREST.TrailingAnnualDividendYield = 'd0';
  Yahoo.qREST.TrailingAnnualDividendYieldInPercent = 'y0';
  Yahoo.qREST.DilutedEPS = 'e0';
  Yahoo.qREST.EBITDA = 'j4';
  Yahoo.qREST.EPSEstimateCurrentYear = 'e7';
  Yahoo.qREST.EPSEstimateNextQuarter = 'e9';
  Yahoo.qREST.EPSEstimateNextYear = 'e8';
  Yahoo.qREST.ExDividendDate = 'q0';
  Yahoo.qREST.FiftydayMovingAvg = 'm3';
  Yahoo.qREST.SharesFloat = 'f6';
  Yahoo.qREST.HighLimit = 'l2';
  Yahoo.qREST.HoldingsGain = 'g4';
  Yahoo.qREST.HoldingsGainPercent = 'g1';
  Yahoo.qREST.HoldingsGainPercentRealtime = 'g5';
  Yahoo.qREST.HoldingsGainRealtime = 'g6';
  Yahoo.qREST.HoldingsValue = 'v1';
  Yahoo.qREST.HoldingsValueRealtime = 'v7';
  Yahoo.qREST.LastTradeDate = 'd1';
  Yahoo.qREST.LastTradePriceOnly = 'l1';
  Yahoo.qREST.LastTradeRealtimeWithTime = 'k1';
  Yahoo.qREST.LastTradeSize = 'k3';
  Yahoo.qREST.LastTradeTime = 't1';
  Yahoo.qREST.LastTradeWithTime = 'l0';
  Yahoo.qREST.LowLimit = 'l3';
  Yahoo.qREST.MarketCapitalization = 'j1';
  Yahoo.qREST.MarketCapRealtime = 'j3';
  Yahoo.qREST.MoreInfo = 'i0';
  Yahoo.qREST.Name = 'n0';
  Yahoo.qREST.Notes = 'n4';
  Yahoo.qREST.OneyrTargetPrice = 't8';
  Yahoo.qREST.Open = 'o0';
  Yahoo.qREST.OrderBookRealtime = 'i5';
  Yahoo.qREST.PEGRatio = 'r5';
  Yahoo.qREST.PERatio = 'r0';
  Yahoo.qREST.PERatioRealtime = 'r2';
  Yahoo.qREST.PercentChangeFromFiftydayMovingAverage = 'm8';
  Yahoo.qREST.PercentChangeFromTwoHundreddayMovingAverage = 'm6';
  Yahoo.qREST.ChangeInPercentFromYearHigh = 'k5';
  Yahoo.qREST.PercentChangeFromYearLow = 'j6';
  Yahoo.qREST.PreviousClose = 'p0';
  Yahoo.qREST.PriceBook = 'p6';
  Yahoo.qREST.PriceEPSEstimateCurrentYear = 'r6';
  Yahoo.qREST.PriceEPSEstimateNextYear = 'r7';
  Yahoo.qREST.PricePaid = 'p1';
  Yahoo.qREST.PriceSales = 'p5';
  Yahoo.qREST.Revenue = 's6';
  Yahoo.qREST.SharesOwned = 's1';
  Yahoo.qREST.SharesOutstanding = 'j2';
  Yahoo.qREST.ShortRatio = 's7';
  Yahoo.qREST.StockExchange = 'x0';
  Yahoo.qREST.Symbol = 's0';
  Yahoo.qREST.TickerTrend = 't7';
  Yahoo.qREST.TradeDate = 'd2';
  Yahoo.qREST.TradeLinks = 't6';
  Yahoo.qREST.TradeLinksAdditional = 'f0';
  Yahoo.qREST.TwoHundreddayMovingAverage = 'm4';
  Yahoo.qREST.Volume = 'v0';
  Yahoo.qREST.YearHigh = 'k0';
  Yahoo.qREST.YearLow = 'j0';
  Yahoo.qREST.YearRange = 'w0';
  // inverted hash:
  for( var key in Yahoo.qREST ) { var ikey = Yahoo.qREST[key]; Yahoo.iqREST[ikey] = key; } 
  console.log('Yahoo initialized REST query paramater hash. length: ' + Yahoo.iqREST.length);
};

module.exports = Yahoo;
