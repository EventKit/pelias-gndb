const dbclient  = require( 'pelias-dbclient' ),
      geonames  = require( 'geonames-stream' ),
      model     = require( 'pelias-model' ),
      split2    = require( 'split2' ),
      unzipper  = require( 'unzipper' );

const parserStream = require( '../streams/tsvparser' ),
      featureCodeFilterStream = require( '../streams/featureCodeFilterStream' ),
      layerMappingStream = require( '../streams/layerMappingStream'),
      peliasDocGenerator = require( '../streams/peliasDocGenerator'),
      overrideLookedUpLocalityAndLocaladmin = require('../streams/overrideLookedUpLocalityAndLocaladmin'),
      adminLookupStream       = require( 'pelias-wof-admin-lookup' );

const customSchema = require( '../../data/schema.json' ).geoname;
const countryCodeRegex = /[A-Z]{2}\.txt/i;

module.exports = function( sourceStream, endStream ){
  endStream = endStream || dbclient({ batchSize: 100});

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
