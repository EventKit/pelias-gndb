'use strict';

const logger = require( 'pelias-logger' ).get( 'geographicnames' ),
      util = require('util'),
      child_process = require('child_process'),
      validateISOCode = require('../lib/validateISOCode'),
      request = require('request'),
      progress = require('request-progress'),
      fs = require('fs'),
      readline = require('readline'),
      Table = require('cli-table');

const config = require('pelias-config').generate(),
      basepath = config.imports.geographicnames.datapath,
      isocode = validateISOCode(config.imports.geographicnames.countryCode);

const filenames = require('../metadata/isocodes.json'),
      filename = isocode === 'ALL' ? filenames.all : isocode;

const remoteFilePath = `http://geonames.nga.mil/gns/html/cntyfile/${filename}.zip`,
      localFileName = `${basepath}/${filename}.zip`;

logger.info( 'downloading datafile from:', remoteFilePath );


// HELPER FUNCTIONS
function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function formatBytes(bytes, decimals) {
   if(bytes == 0) return '0 Bytes';
   var k = 1024,
       dm = decimals || 2,
       sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function secondsToHMS(seconds) {
  var h = (Math.floor(seconds / 3600)).toString().padStart(2, '0');
  seconds %= 3600;
  var m  = (Math.floor(seconds / 60)).toString().padStart(2, '0');
  var s = (seconds % 60).toString().padStart(2, '0');

  return util.format('%s:%s:%s', h, m, s);
}

function overwriteTTYLine(table, logArray) {
  table.pop();
  table.push( logArray );
  var logLine = table.toString().split('\n')[1];

  // Write the progress to console
  readline.clearLine(process.stdout);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write( logLine );
}


var table = new Table({
    head: ['%     ','Received Data','Total Data','Time Left','Time Spent','Time Total'],
    chars: { 'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
        'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
        'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '', 'right': '',
        'right-mid': '', 'middle': '   ' },
});
var zeroTimeStr = '00:00:00',
    hundredPercentStr = precisionRound(100, 2).toFixed(2),
    total = formatBytes(0),
    timeTotalStr = zeroTimeStr;


table.push([0, 0, 0, zeroTimeStr, zeroTimeStr, zeroTimeStr]);
process.stdout.write(table.toString());

progress(request(remoteFilePath), {})
  .on('progress', function (state) {
    var percent = precisionRound(state.percent*100, 2).toFixed(2),
        received = formatBytes(state.size.transferred),
        timeSpent = precisionRound(state.time.elapsed, 0),
        timeLeft = precisionRound(state.time.remaining, 0),
        timeTotal = timeLeft + timeSpent,
        timeSpentStr = secondsToHMS(timeSpent),
        timeLeftStr = secondsToHMS(timeLeft);

    total = formatBytes(state.size.total);
    timeTotalStr = secondsToHMS(timeTotal);

    var logArray = [ percent, received, total, timeLeftStr, timeSpentStr, timeTotalStr ];
    overwriteTTYLine(table, logArray);
  })
  .on('error', function (err) {
    process.stderr.write(err);
  })
  .on('end', function () {
    var logArray = [ hundredPercentStr, total, total, zeroTimeStr, timeTotalStr, timeTotalStr ];
    overwriteTTYLine(table, logArray);
    console.log( '\n' );
    logger.info( 'Done downloading', filename );
  })
  .pipe(fs.createWriteStream(localFileName));
