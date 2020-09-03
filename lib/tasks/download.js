const child_process = require('child_process');
const fs = require('fs');

// use datapath setting from your config file
const logger = require( 'pelias-logger' ).get( 'geographicnames' );

const config = require('pelias-config').generate();
const sourceURL = config.imports.geonames.sourceURL;

const basepath = config.imports.geographicnames.datapath;

module.exports = function (countryCode) {

  fs.mkdirSync(basepath, { recursive: true });

  const urlPrefix = sourceURL || 'http://geonames.nga.mil/gns/html/cntyfile';
  const remoteFilePath = `${urlPrefix}/${countryCode}.zip`;
  const localFileName = `${basepath}/${countryCode}.zip`;

  logger.info( 'downloading datafile from:', remoteFilePath );

  const command = `curl -L --output ${localFileName} ${remoteFilePath}`;

  const job = child_process.exec(command);

  job.stdout.on('data', (data) => {
      process.stdout.write(data);
  });

  job.stderr.on('data', (data) => {
      process.stderr.write(data);
  });

  job.on('close', (code) => {
      console.log(`Geonames download finished with exit code ${code}`);
      process.exitCode = code;
  });
};
