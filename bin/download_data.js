'use strict';

const logger = require( 'pelias-logger' ).get( 'geonamesmil' ),
      child_process = require('child_process'),
      validateISOCode = require('../lib/validateISOCode');

const config = require('pelias-config').generate();
const basepath = config.imports.geonamesmil.datapath;
const isocode = validateISOCode(config.imports.geonamesmil.countryCode);

const filenames = require('./metadata/isocodes.json');
const filename = isocode === 'ALL' ? filenames.all : isocode;


const remoteFilePath = `http://geonames.nga.mil/gns/html/cntyfile/${filename}.zip`;
const localFileName = `${basepath}/${filename}.zip`;
logger.info( 'downloading datafile from:', remoteFilePath );
const command = `curl ${remoteFilePath} > ${localFileName}`;
const job = child_process.exec(command);

job.stdout.on('data', (data) => {
    process.stdout.write(data);
});

job.stderr.on('data', (data) => {
    process.stderr.write(data);
});

job.on('close', (code) => {
    logger.info(`Geonames.mil download finished with exit code ${code}`);
    process.exitCode = code;
});
