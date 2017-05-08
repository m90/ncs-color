# ncs-color
> Conversion tool for color values specified using the [`Natural Color System`](http://en.wikipedia.org/wiki/Natural_Color_System)

This module converts colors represented in **NCS format** to their corresponding Hex or RGB values. It works both with first edition values and second edition values (i.e. `NCS 5000-N` or `NCS S 2060-G20Y`). Note that this module does **not** check if the passed color value is actually possible to produce in actual manufacturing environments (only ~1950 colors are actually available).

## Usage

### CommonJS:
```javascript
const ncsColor = require('ncs-color');
ncsColor.hex('NCS S 2080-G20Y'); // => '#65d636'
```

### AMD:
```javascript
require(['ncs-color'], function(ncsColor){
	ncsColor.rgb('NCS 5000-N'); // => 'rgb(127,127,127)'
});
```

### Global:
```html
<script src="https://unpkg.com/ncs-color@0.2.1/ncscolor.min.js"></script>
<script>
    ncsColor.hex('NCS S 2060-B'); // => '#399bd6'
</script>
```

### Available on npm:
```sh
$ npm install ncs-color --save
```

### License
MIT © [Frederik Ring](http://www.frederikring.com)
