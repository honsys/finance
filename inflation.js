#!/usr/bin/env node
//NODE_ENV=development node client.js ftp://example.com/ftp/url.foo
var _App = {};
_App.ftp = require('ftp-get');
_App.fs = require('fs');
_App.Emitter = require('events').EventEmitter;
_App.event = new _App.Emitter();

// latest month (monthly cpi with annual diffs.) from 1913 through now (ish) 
_App.url_cpitxt = 'ftp://ftp.bls.gov/pub/special.requests/cpi/cpiai.txt'
_App.savefile = './cpi1913now.txt';
//_App.data = [];
_App.yhash = {};
_App.yrate = {};
_App.yrcnt = 0;

_App.evalRate = function(year, monthly, mprev) {
  if( monthly.length <= 0 ) { return 0.0; }
  var rates = [0.0], len = monthly.length, net = 0.0, m = 0.0;
  if( len > 12 ) { len = 12; }
  for( var i = 0; i < len; i++ ) {
    mi = parseFloat(monthly[i]);
    m = (mi / mprev) - 1.0;
    rates.push(m);
    net = net + m;
    //if( year == '1913' ) { console.log(year + ':' + i +' ==> ' + mi + ' --> ' + m + ' ==> ' + net); }
    //if( year == '2013' ) { console.log(year + ':' + i +' ==> ' + mi + ' --> ' + m + ' ==> ' + net); }
    mprev = mi;
  }
  net = 100.0 * net; // units == %
  var mnet = net / len; // units == %
  //if( year == '1913' ) { console.log(year + ' == ' + net + ' ==> ' + rates); }
  //if( year == '2013' ) { console.log(year + ' == ' + net + ' ==> ' + rates); }
  console.log('average monthly inflation rate (%): ' + year + ' == ' + mnet); // + ' ==> ' + rates); 
  console.log('average annualized inflation rate (%): ' + year + ' == ' + net); // + ' ==> ' + rates); 
  return net;
} 

_App.parseCPI = function(startyear, yearcnt) {
  var finalyear = parseInt(startyear) + parseInt(yearcnt);
  var cnt = 0, line = "";
  var text = _App.fs.readFileSync(_App.savefile, 'utf8');
  var lines = text.split("\n");
  var headercnt = 18; // ignore the first 18 lines (hopefully this header line-count is reliable const.)
  var mprev = 0.0, mlen = 0;
  for(var i = 18, llen = lines.length; i < llen && cnt <= yearcnt; i++) {
    //var tmp = lines[i].match(/^.*:\[(\w{3} \d{2} \d{4})\]/);
    //if(tmp !== null) { data.push(tmp[1]); }
    var year = '', monthly = [];
    line = lines[i].replace(/\s+/g, " ").trim();
    line = line.replace(/\r/g, "").trim();
    //console.log(i + ': ' + line);
    if( line !== '' ) {
      //_App.data.push(line);
      monthly = line.split(' ');
      year = monthly[0];
      console.log(year + ' of range: ' + startyear + ' + ' + finalyear);
      // remove the year column and store the monthly vals
      mlen = monthly.length; 
      if( mlen > 13 ) { 
        mlen = 12;
        monthly = monthly.slice(1, 1+mlen);
      }
      else {
        monthly = monthly.slice(1);
      } // exclude all other columns (avgs, etc.)
      _App.yhash[year] = monthly;
      if( cnt === 0 ) { mprev = parseFloat(monthly[0]); } // use jan. of this year if there is no prior dec.
      _App.yrate[year] = _App.evalRate(year, monthly, mprev);
      cnt = 1 + cnt;
      mprev = parseFloat(monthly[11]); // save dec. of this year to use in following year/monthly
    }
    if( year == '1913' ) { console.log(year + '==> ' + _App.yrate[year]); }
  }

  //console.log(_data);
  //console.log(_yhash);
  return cnt;
}

_App.fetchCPI = function(startyear, yearcnt) {
  if( typeof startyear === 'undefined' ) { // evaluates to true without errors
    startyear = startyear || 1913;
  }
  if( typeof yearcnt === 'undefined' ) { // evaluates to true without errors
    yearcnt = yearcnt || 100;
  }
  // async ftp-get:
  _App.ftp.get(_App.url_cpitxt, _App.savefile, function (err, res) {
    console.log(err, res);
    _App.yrcnt = _App.parseCPI(startyear, yearcnt);
  });
}

_App.saveResults = function(outfile) {
  // save rsulting monthly and annualized inflation rates array as json file for subsequent rendering
  var outjson = JSON.stringify(_App.yrate, null, 2) + JSON.stringify(_App.yhash, null, 2);
  _App.fs.writeFileSync(outfile, outjson, 'utf8');
}

_App.startHeartbeat = function(startyear, yearcnt) {
  setInterval((function() {
    if( _App.yrcnt < yearcnt ) {
      console.log('... awaiting completion of all transactions of ' + yearcnt + ' years of inflation ...');
      return;
    }
    _App.event.emit('SaveAndExit', startyear);
  }), 500); // 500 millisec == 0.5 sec interval
};

_App.saveAndExit = function(startyear) {
  console.log('all transactions and calculations have completed.');
  _App.saveResults('rates_of_inflation_from_' + startyear + '.json');
  process.exit(0);
}

_App.main = function(argc, argv) {
  var startyear = '1913', yearcnt = 100;
  if( typeof argc !== 'undefined' && typeof argv !== 'undefined' ) {
    if( argc > 0 ) {
      startyear = parseInt(argv[0]);
    }
    else {
      startyear = startyear || '1913';
    }
    if( argc > 1 ) {
      yearcnt = parseInt(argv[1]);
    }
    else {
      yearcnt = yearcnt || 100;
    }
  }
  else {
    startyear = startyear || '1913'; 
    yearcnt = yearcnt || 100;
  }
  console.log('nodejs: ' + process.version);
  //_App.event.once('SaveAndExit', _App.saveAndExit);
  //_App.event.addListener('SaveAndExit', _App.saveAndExit);
  _App.event.on('SaveAndExit', _App.saveAndExit);
  _App.fetchCPI(startyear, yearcnt);
  _App.startHeartbeat(startyear, yearcnt);
};

//_App.main();
args = ['1913', 100];
_App.main(args.length, args);
