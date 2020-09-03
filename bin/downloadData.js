'use strict';

const config = require('pelias-config').generate();
const validateISOCode = require('../lib/validateISOCode');

const isocode = validateISOCode(config.imports.geographicnames.countryCode);
const filenames = require('../metadata/isocodes.json');
const filename = isocode === 'ALL' ? filenames.all : isocode;
const task = require('../lib/tasks/download');

task(filename);
