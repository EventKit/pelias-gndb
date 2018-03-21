var tape = require('tape');
var event_stream = require('event-stream');

var layerMappingStream = require('../../lib/streams/layerMappingStream');
var featureCodeToLayer = layerMappingStream.featureCodeToLayer;

function test_stream(input, testedStream, callback) {
    var input_stream = event_stream.readArray(input);
    var destination_stream = event_stream.writeArray(callback);

    input_stream.pipe(testedStream).pipe(destination_stream);
}

tape('featureCodeToLayer', function(test) {
  test.test('unusual feature code should map to venue', function(t) {
    t.equal(featureCodeToLayer('CNL'), 'venue', 'all codes not handled map to venue');
    t.end();
  });

  test.test('ADM1 maps to region', function(t) {
    t.equal(featureCodeToLayer('ADM1'), 'region', 'GNDB ADM1 maps to region layer');
    t.end();
  });

  test.test('ADM2 maps to county', function(t) {
    t.equal(featureCodeToLayer('ADM2'), 'county', 'GNDB ADM2 maps to county layer');
    t.end();
  });

  test.test('ADMD maps to localadmin', function(t) {
    t.equal(featureCodeToLayer('ADMD'), 'localadmin', 'GNDB ADMD maps to localadmin layer');
    t.end();
  });

  test.test('neighborhood is spelled the Queen\'s way', function(t) {
    t.equal(featureCodeToLayer('PPLX'), 'neighbourhood', 'neighbourhood uses British spelling');
    t.end();
  });
});

tape('country specific featureCodes', function(test) {
  test.test('ADM1 in GB maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'GB'), 'macroregion', 'GNDB ADM1 maps to macroregion in Great Britain');
    t.end();
  });

  test.test('RGN in FR maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('RGN', 'FR'), 'macroregion', 'GNDB RGN maps to macroregion in France');
    t.end();
  });

  test.test('ADM1 in ES maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'ES'), 'macroregion', 'GNDB ADM1 maps to macroregion in Spain');
    t.end();
  });

  test.test('ADM1 in IT maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'IT'), 'macroregion', 'GNDB ADM1 maps to macroregion in Italy');
    t.end();
  });
});

tape('layerMappingStream', function(test) {
  test.test('stream of raw GNDB entries has layers correctly mapped', function(t) {
    var input = [
      { dsg: 'OCN' },
      { dsg: 'ADM1' },
      { dsg: 'POOL' },
      { dsg: 'ADMD' } ];
    var stream = layerMappingStream.create();

    test_stream(input, stream, function(err, results) {
      var actual = results.map(function(doc) {
        return doc.layer;
      });

      var expected = [ 'venue', 'region', 'venue', 'localadmin' ];
      test.deepEqual(actual, expected, 'layers mapped correctly');
      t.end();
    });
  });
});

tape('IDtoLayer', function(test){
  test.test('special cases: the nyc boroughs', function(t){
    var input = [
    {uni: 5110302, dsg: 'PPLA2'},
    {uni: 5125771, dsg: 'PPLA2'},
    {uni: 5133273, dsg: 'PPLA2'},
    {uni: 5110266, dsg: 'PPLA2'},
    {uni: 5139568, dsg: 'PPLA2'},
    {uni: 5112223, dsg: 'PPLA'}];
    var stream = layerMappingStream.create();

    test_stream(input,stream,function(err, results){
      var actual = results.map(function(doc){
        return doc.layer;
      });
      var expected = ['borough','borough','borough','borough','borough','locality'];

      test.deepEqual(actual,expected,'special case: NYC handled');
      t.end();
    });
  });
});
