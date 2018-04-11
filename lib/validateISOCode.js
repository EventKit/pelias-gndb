'use strict';

const isocodes  = require('../metadata/isocodes').isocodes;
const logger    = require( 'pelias-logger' ).get( 'geographicnames' );

function error( message ){
  logger.error( '\n  ' + message + '\n' );
  process.exit( 1 );
}

function validateISOCode( input ){
  var isocode = ( 'string' === typeof input ) ? input.toUpperCase() : null;

  if( !isocode || ( isocode !== 'ALL' && isocodes.indexOf(isocode) < 0 ) ){
    const message = `${isocode} is an invalid ISO code. either use \'ALL\'` +
                    `or list available ISO codes with \`npm run countryCodes\``;
    error( message);
  }
  return isocode;
}

module.exports = validateISOCode;
