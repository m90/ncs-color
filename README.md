#ncs-color
### Conversion tool for color values specified using the [`Natural Color System`](http://en.wikipedia.org/wiki/Natural_Color_System)

This module converts colors represented in **NCS format** to their corresponding Hex or RGB values. It works both with first edition values and second edition values (i.e. `NCS 5000-N` or `NCS S 2060-G20Y`). Note that this module does **NOT** check if the passed color value is actually possible to produce in actual manufacturing environments.

###Usage
```javascript
var hex = require('ncs-color').hex;
hex('NCS S 2080-G20Y'); // => '#65d636'
```
or
```javascript
require(['ncs-color'], function(ncs){
	ncs.rgb('NCS 5000-N'); // => 'rgb(127,127,127)'
});
```
Available via npm:
```sh
npm install ncs-color --save
```

###License
MIT © [Frederik Ring](http://www.frederikring.com)
