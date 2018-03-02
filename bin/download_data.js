'use strict';

const logger = require( 'pelias-logger' ).get( 'geonamesmil' ),
      util = require('util'),
      child_process = require('child_process'),
      validateISOCode = require('../lib/validateISOCode'),
      request = require('request'),
      progress = require('request-progress'),
      fs = require('fs'),
      Table = require('cli-table');

const config = require('pelias-config').generate();
const basepath = config.imports.geonamesmil.datapath;
const isocode = validateISOCode(config.imports.geonamesmil.countryCode);

const filenames = require('../metadata/isocodes.json');
const filename = isocode === 'ALL' ? filenames.all : isocode;


const remoteFilePath = `http://geonames.nga.mil/gns/html/cntyfile/${filename}.zip`;
const localFileName = `${basepath}/${filename}.zip`;
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


var table = new Table({
    head: ['%     ','Received Data','Total Data','Time Left','Time Spent','Time Total'],
    chars: { 'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
        'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
        'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '', 'right': '',
        'right-mid': '', 'middle': '   ' },
});
table.push([0, 0, 0, '00:00:00', '00:00:00', '00:00:00']);
process.stdout.write(table.toString());

progress(request(remoteFilePath), {})
  .on('progress', function (state) {
    var percent = precisionRound(state.percent*100, 2).toFixed(2),
        total = formatBytes(state.size.total),
        received = formatBytes(state.size.transferred),
        timeSpent = precisionRound(state.time.elapsed, 0),
        timeLeft = precisionRound(state.time.remaining, 0),
        timeTotal = timeLeft + timeSpent;

    var logArray = [ percent, received, total, timeLeft, timeSpent, timeTotal ];

    table.pop();
    table.push( logArray );
    var logLine = table.toString().split('\n')[1];

    // Write the progress to console
    process.stdout.clearLine();
    process.stdout.cursorTo( 0 );
    process.stdout.write( logLine );
  })
  .on('error', function (err) {
    process.stderr.write(err);
  })
  .on('end', function () {
    console.log( 'Done downloadin', filename );
  })
  .pipe(fs.createWriteStream(localFileName));
