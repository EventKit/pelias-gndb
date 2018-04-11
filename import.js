const config = require('pelias-config').generate(),
      _ = require('lodash'),
      logger = require('pelias-logger').get('geographicnames');

if (_.has(config, 'imports.geographicnames.adminLookup')) {
  logger.info('imports.geographicnames.adminLookup has been deprecated, ' +
              'enable adminLookup using imports.adminLookup.enabled = true');
}

const resolvers = require( './lib/tasks/resolvers' ),
      task = require('./lib/tasks/import'),
      validateISOCode = require('./lib/validateISOCode');

const filenames = require('./metadata/isocodes.json');
const isocode = validateISOCode( config.imports.geographicnames.countryCode );
const filename = isocode === 'ALL' ? filenames.all : isocode;
const source = resolvers.selectSource( filename );
task( source );
