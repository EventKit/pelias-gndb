const dbclient  = require( 'pelias-dbclient' );
const geonames  = require( 'geonames-stream' );
const model     = require( 'pelias-model' );
const split2    = require( 'split2' );
const unzipper  = require( 'unzipper' );
const blacklistStream = require('pelias-blacklist-stream');

const parserStream = require( '../streams/tsvparser' );
const featureCodeFilterStream = require( '../streams/featureCodeFilterStream' );
const adminLookupStream = require( 'pelias-wof-admin-lookup' );
const layerMappingStream = require( '../streams/layerMappingStream');
const peliasDocGenerator = require( '../streams/peliasDocGenerator');
const overrideLookedUpLocalityAndLocaladmin = require('../streams/overrideLookedUpLocalityAndLocaladmin');

const customSchema = require( '../../data/schema.json' ).geoname;
const countryCodeRegex = /[A-Z]{2}\.txt/i;

module.exports = function( sourceStream, endStream ){
  endStream = endStream || dbclient({name: 'geographicnames'});

  return sourceStream.pipe( unzipper.ParseOne(countryCodeRegex) )
    .pipe( split2() )
    .pipe( parserStream(customSchema) )
    .pipe( geonames.modifiers() )
    .pipe( featureCodeFilterStream.create() )
    .pipe( layerMappingStream.create() )
    .pipe( peliasDocGenerator.create() )
    .pipe( blacklistStream() )
    .pipe( adminLookupStream.create() )
    .pipe( overrideLookedUpLocalityAndLocaladmin.create() )
    .pipe( model.createDocumentMapperStream() )
    .pipe( endStream );
};
