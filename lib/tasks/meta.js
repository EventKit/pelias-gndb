/**
 Pelias geographicnames metadata downloader
 -----------------------------------

 Downloads & updates local copy of geographicnames meta-data.
 **/

let fs = require('fs'),
    path = require('path'),
    request = require('request'),
    jsdom = require('jsdom');

const {JSDOM} = jsdom;

const dest = 'metadata';
const htmlRoot = 'http://geonames.nga.mil/gns/html';
const namesUrl = `${htmlRoot}/namefiles.html`;
const searchText = 'Entire country files dataset';

var download = function () {
    request.get(namesUrl, (e, r, body) => {
        const dom = new JSDOM(body);
        // var xpath = `//a[text()='${searchText}']`;
        dom.window.document.querySelectorAll('a').forEach(
            function (element) {
                if (element.textContent === searchText) {
                  const zipFileName = element.href;

                  // write the new metadata to file
                  var outputFilename = path.join(dest, 'isocodes.json');
                  let metadata = JSON.parse(fs.readFileSync(outputFilename, 'utf8'));
                  metadata.all = path.basename(zipFileName, '.zip');
                  var jsonString = JSON.stringify(metadata, null, 2);

                  fs.writeFile(outputFilename, jsonString, function (err) {
                    if (err) {
                      return console.log(err);
                    }

                    console.log('Metadata file updated.');
                  });
                }
            }
        );
    });

    return;
};

module.exports = function () {
    download();
};
