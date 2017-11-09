var Document = require( 'pelias-model' ).Document;
var logger = require( 'pelias-logger' ).get( 'geonamesmil' );
var categoryMapping = require( '../../metadata/category_mapping.json' );
var through2 = require('through2');

module.exports = {};

module.exports.create = function() {
  return through2.obj(function(data, enc, next) {
    var record;
    try {
      var layer = data.layer || 'venue';
      record = new Document( 'geonamesmil', layer, data._id )
        .setName( 'default', data.name.trim() )
        .setCentroid({
          lat: data.lat,
          lon: data.long
        });

      try {
        var population = parseInt(data.pop, 10);
        if (population) {
          record.setPopulation( population );
        }
      } catch( err ){}

      if( typeof data.feature_code === 'string' ){
        record.setMeta( 'fcode', data.dsg );

        var featureCode = data.dsg.toUpperCase();
        if( categoryMapping.hasOwnProperty( featureCode ) ){
          var peliasCategories = categoryMapping[ featureCode ];
          peliasCategories.forEach( function ( category ){
            record.addCategory( category );
          });
        }
      }

    } catch( e ){
      logger.warn(
        'Failed to create a Document from:', data, 'Exception:', e
      );
    }

    // copy 'name' object to 'phrase' in order to allow ES to create
    // separate indices with different analysis techniques.
    console.log(record);
    if( record !== undefined ){
      record.phrase = record.name;
      this.push( record );
    }
    next();
  });
};
