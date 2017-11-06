const config = require('pelias-config').generate();
const _ = require('lodash');
const logger = require('pelias-logger').get('geonamesmil');

if (_.has(config, 'imports.geonamesmil.adminLookup')) {
  logger.info('imports.geonamesmil.adminLookup has been deprecated, ' +
              'enable adminLookup using imports.adminLookup.enabled = true');
}

const resolvers = require( './lib/tasks/resolvers' );
const task = require('./lib/tasks/import');
const validateISOCode = require('./lib/validateISOCode');

const isocode = validateISOCode( config.imports.geonamesmil.countryCode );
var filenames = [isocode];

logger.info( filenames );

if (isocode === 'ALL') {
  var filenames = require('./metadata/isocodes.json').isocodes;
}

logger.info( filenames.length );

for (var i = 0; i < filenames.length; i++) {
  const filename = filenames[i];

  logger.info( 'importing datafile:', filename );

  const source = resolvers.selectSource( filename );
  task( source );
}
