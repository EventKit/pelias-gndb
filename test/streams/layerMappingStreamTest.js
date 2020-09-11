var tape = require('tape');

var layerMappingStream = require('../../lib/streams/layerMappingStream');
var featureCodeToLayer = layerMappingStream.featureCodeToLayer;

const stream_mock = require('stream-mock');

function test_stream(input, testedStream, callback) {
  const reader = new stream_mock.ObjectReadableMock(input);
  const writer = new stream_mock.ObjectWritableMock();
  writer.on('error', (e) => callback(e));
  writer.on('finish', () => callback(null, writer.data));
  reader.pipe(testedStream).pipe(writer);
}

tape('featureCodeToLayer', function(test) {
  test.test('unusual feature code should map to venue', function(t) {
    t.equal(featureCodeToLayer('CNL'), 'venue', 'all codes not handled map to venue');
    t.end();
  });

  test.test('ADM1 maps to region', function(t) {
    t.equal(featureCodeToLayer('ADM1'), 'region', 'Geographicnames ADM1 maps to region layer');
    t.end();
  });

  test.test('ADM2 maps to county', function(t) {
    t.equal(featureCodeToLayer('ADM2'), 'county', 'Geographicnames ADM2 maps to county layer');
    t.end();
  });

  test.test('ADMD maps to localadmin', function(t) {
    t.equal(featureCodeToLayer('ADMD'), 'localadmin', 'Geographicnames ADMD maps to localadmin layer');
    t.end();
  });

  test.test('neighborhood is spelled the Queen\'s way', function(t) {
    t.equal(featureCodeToLayer('PPLX'), 'neighbourhood', 'neighbourhood uses British spelling');
    t.end();
  });
});

tape('country specific featureCodes', function(test) {
  test.test('ADM1 in GB maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'GB'), 'macroregion',
        'Geographicnames ADM1 maps to macroregion in Great Britain');
    t.end();
  });

  test.test('ADM1 in FR maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'FR'), 'macroregion', 'Geographicnames ADM1 maps to macroregion in France');
    t.end();
  });

  test.test('ADM2 in FR maps to region', function(t) {
    t.equal(featureCodeToLayer('ADM2', 'FR'), 'region', 'Geographicnames ADM2 maps to region in France');
    t.end();
  });

  test.test('ADM3 in FR maps to macrocounty', function(t) {
    t.equal(featureCodeToLayer('ADM3', 'FR'), 'macrocounty', 'Geographicnames ADM3 maps to macrocounty in France');
    t.end();
  });

  test.test('ADM4 in FR maps to locality', function(t) {
    t.equal(featureCodeToLayer('ADM4', 'FR'), 'locality', 'Geographicnames ADM4 maps to locality in France');
    t.end();
  });

  test.test('LCTY in FR maps to venue', function(t) {
    t.equal(featureCodeToLayer('LCTY', 'FR'), 'venue', 'Geographicnames LCTY maps to venue in France');
    t.end();
  });

  test.test('ADM1 in ES maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'ES'), 'macroregion', 'Geographicnames ADM1 maps to macroregion in Spain');
    t.end();
  });

  test.test('ADM1 in IT maps to macroregion', function(t) {
    t.equal(featureCodeToLayer('ADM1', 'IT'), 'macroregion', 'Geographicnames ADM1 maps to macroregion in Italy');
    t.end();
  });
});

tape('layerMappingStream', function(test) {
  test.test('stream of raw Geographicnames entries has layers correctly mapped', function(t) {
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
