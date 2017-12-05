var dbclient  = require( 'pelias-dbclient' );
var geonames  = require( 'geonames-stream' );
var model     = require( 'pelias-model' );
var split2    = require( 'split2' );
var unzipper  = require( 'unzipper' );

var featureCodeFilterStream = require( '../streams/featureCodeFilterStream' );
var adminLookupStream       = require( 'pelias-wof-admin-lookup' );
var layerMappingStream      = require( '../streams/layerMappingStream');
var peliasDocGenerator      = require( '../streams/peliasDocGenerator');
var overrideLookedUpLocalityAndLocaladmin = require('../streams/overrideLookedUpLocalityAndLocaladmin');

var parserStream  = require( '../streams/tsvparser' );
var customSchema  = require( '../../data/schema.json' ).geoname;
var countryCodeRegex         = /[A-Z]{2}\.txt/i;


module.exports = function( sourceStream, endStream ){
  endStream = endStream || dbclient();

  return sourceStream.pipe( unzipper.ParseOne(countryCodeRegex) )
    .pipe( split2() )
    .pipe( parserStream(customSchema) )
    .pipe( geonames.modifiers() )
    .pipe( featureCodeFilterStream.create() )
    .pipe( layerMappingStream.create() )
    .pipe( peliasDocGenerator.create() )
    .pipe( adminLookupStream.create() )
    .pipe( overrideLookedUpLocalityAndLocaladmin.create() )
    .pipe( model.createDocumentMapperStream() )
    .pipe( endStream );
};
