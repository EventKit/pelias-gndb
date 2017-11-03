var geonames  = require( 'geonames-stream' );
var dbclient  = require( 'pelias-dbclient' );
var model     = require( 'pelias-model' );
var split     = require( 'split' );

var featureCodeFilterStream = require( '../streams/featureCodeFilterStream' );
var adminLookupStream       = require( 'pelias-wof-admin-lookup' );
var layerMappingStream      = require( '../streams/layerMappingStream');
var peliasDocGenerator      = require( '../streams/peliasDocGenerator');
var overrideLookedUpLocalityAndLocaladmin = require('../streams/overrideLookedUpLocalityAndLocaladmin');

var unzipStream   = require( '../streams/unzip' );
var customSchema  = require( '../../data/schema.json' ).geoname;


module.exports = function( sourceStream, endStream ){
  endStream = endStream || dbclient();

  return sourceStream.pipe( unzipStream.unzip() )
    // need to grab specific file here
    .pipe( split() )
    .pipe( geonames.parser(customSchema) )
    .pipe( geonames.modifiers() )

    .pipe( featureCodeFilterStream.create() )
    .pipe( layerMappingStream.create() )
    .pipe( peliasDocGenerator.create() )
    .pipe( adminLookupStream.create() )
    .pipe( overrideLookedUpLocalityAndLocaladmin.create() )
    .pipe( model.createDocumentMapperStream() )
    .pipe( endStream );
};
