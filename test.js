var
ncs = require('./index.js')
, assert = require('assert');

describe('ncs', function(){

	it('converts NCS color names to hex values', function(){
		assert(ncs.hex('NCS S 2080-G20Y'), '#65d636');
		assert(ncs.hex('NCS 2080-G20Y'), '#65d636');
	});

	it('converts NCS color names to rgb values', function(){
		assert(ncs.rgb('NCS S 5000-N'), 'rgb(127,127,127)');
		assert(ncs.rgb('NCS 5000-N'), 'rgb(127,127,127)');
	});

});