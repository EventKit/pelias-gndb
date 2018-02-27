const config = require('pelias-config').generate();,
      _ = require('lodash'),
      logger = require('pelias-logger').get('geonamesmil'),

if (_.has(config, 'imports.geonamesmil.adminLookup')) {
  logger.info('imports.geonamesmil.adminLookup has been deprecated, ' +
              'enable adminLookup using imports.adminLookup.enabled = true');
}

const resolvers = require( './lib/tasks/resolvers' ),
      task = require('./lib/tasks/import'),
      validateISOCode = require('./lib/validateISOCode');

const filenames = require('./metadata/isocodes.json');
const isocode = validateISOCode( config.imports.geonamesmil.countryCode );
const filename = isocode === 'ALL' ? filenames.all : isocode;
const source = resolvers.selectSource( filename );
task( source );
