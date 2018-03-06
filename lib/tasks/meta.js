
/**
  Pelias Geonames.mil metadata downloader
  -----------------------------------

  Downloads & updates local copy of geonames-org meta-data.
**/

var Jsftp = require('jsftp'),
    fs = require('fs'),
    path = require('path');

const isocodeRegex       = /^[A-Z]{2}\.zip/i;
const fullDatasetRegex  = /geonames_([0-9]{8,})\.zip/i;

var dir   = 'pub2/gns_data/',
    dest  = 'metadata';

var download = function() {
  var connectFtp = {
    host: 'ftp.nga.mil'
  };

  var ftp = new Jsftp( connectFtp );
  ftp.ls(dir, function(err, res) {

    var json = {
        isocodes: [],
        all: ''
    };

    res.forEach( function(entry) {
      // skip if entry is a directory
      if (entry.type === 1) {
        return;
      }

      var filename = entry.name;

      if ( isocodeRegex.test(filename) ) {
        // push isocode onto array
        var isocode = filename.substring(0,2).toUpperCase();
        json.isocodes.push(isocode);
      } else if ( fullDatasetRegex.test(filename) ) {
        // set name of the full dataset file
        json.all = filename.substring(0, (filename.length - '.zip'.length) );
      }

    });

    // write the new metadata to file
    var outputFilename = path.join(dest, 'isocodes.json');
    var jsonString = JSON.stringify(json, null, 2);

    fs.writeFile(outputFilename, jsonString, function (err) {
      if (err) {
        return console.log(err);
      }

      console.log('Metadata file updated.');
    });
  });

  return;
};

module.exports = function() {
  download( );
};
