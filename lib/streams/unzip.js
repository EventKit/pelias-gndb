// stream unzip files
var unzip = require('unzipper'),
    bun = require('bun'),
    passthrough = require('readable-stream/passthrough');

module.exports = function() {

  var output = new passthrough();
  var parser = unzip.Parse();

  parser
    .on( 'error', console.error.bind( console ) )
    .on( 'entry', function( entry ) {
      // skip readme files
      // if( entry.props.path.match( 'readme' ) ){
      //   return entry.autodrain();
      // }
      // return entry.pipe( output );


      // skip all files that aren't the base country code
      var regex = /[A-Z]{2}\.txt/i;
      if( entry.props.path.match( regex ) ){
        return entry.autodrain();
      }
      return entry.pipe( output );

    });

  var stream = bun([ parser, output ]);
  parser.unpipe( output );

  return stream;
};
