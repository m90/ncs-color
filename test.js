/* global describe, it */

var ncs = require('./ncscolor.js')
var assert = require('assert')

describe('ncs', function () {
  it('converts NCS color names to hex values', function () {
    assert.strictEqual(ncs.hex('NCS S 2080-G20Y'), '#65d636')
    assert.strictEqual(ncs.hex('NCS 2080-G20Y'), '#65d636')
    assert.strictEqual(ncs.hex('NCS S 2060-B'), '#399bd6')
  })

  it('converts NCS color names to rgb values', function () {
    assert.strictEqual(ncs.rgb('NCS S 5000-N'), 'rgb(127,127,127)')
    assert.strictEqual(ncs.rgb('NCS 5000-N'), 'rgb(127,127,127)')
  })

  it('returns null if invalid NCS color name', function () {
    assert.strictEqual(ncs.rgb(''), null)
    assert.strictEqual(ncs.hex('NCS5000-N'), null)
    assert.strictEqual(ncs.hex('12345'), null)
    assert.strictEqual(ncs.hex('NCS 5000-Z20Y'), null)
    assert.strictEqual(ncs.hex('NCS 4055-R20Z'), null)
    assert.notStrictEqual(ncs.hex('NCS 5000-N'), null)
  })
})



// TODO rename ncsColorLib to ncs
// TODO rename ncsOfDegrees to ncsHueOfDegrees
// TODO allow test to finish, dont exit on the first assert fail
// TODO test more nuances
// TODO skip edge case that triggers bug in w3color.js -> NCS 0580-G76Y (etc?)

const w3colorLib = require('./w3color.node.js');
// https://www.w3schools.com/colors/colors_ncs.asp
// https://www.w3schools.com/colors/colors_converter.asp?color=ncs(2030-B30G)
// https://www.w3schools.com/lib/w3color.js

const ncsColorLib = require('./ncscolor.js');
// https://github.com/m90/ncs-color

function ncsOfDegrees(d) {
  // d: 0 == 400
  if (d <    0) return ''; // bad input
  if (d ==   0) return 'R';                  // red
  if (d <  100) return 'R' + (     d) + 'B'; // red-blue
  if (d == 100) return 'B';                  // blue
  if (d <  200) return 'B' + (-100+d) + 'G'; // blue-green
  if (d == 200) return 'G';                  // green
  if (d <  300) return 'G' + (-200+d) + 'Y'; // green-yellow
  if (d == 300) return 'Y';                  // yellow
  if (d <  400) return 'Y' + (-300+d) + 'R'; // yellow-red
  if (d <= 400) return 'R';                  // red
  return ''; // bad input
}

// ncs format: S ${nuance.s}${nuance.c}-${hue.a}${hue.phi}${hue.b}

const log_invalid = false; // 1 <= hue.phi <= 9: invalid color for some algorithms
const log_mismatch = false; // show mismatches between libraries

const maxval = {
  w3color: {
    col: {
      red: 255, green: 255, blue: 255,
      hue: 360, // of 360
      sat: 1, lightness: 1,
      whiteness: 1, blackness: 1,
    },
  },
  ncsColor: {
    col: {
      r: 255, g: 255, b: 255,
    },
  }
};

// tolerance in percent (inclusive values)
// sample bug with color NCS 0580-G76Y
//   unsteady value: ncsColor.col.r: 253 - 357 = -41%
//   unsteady value: ncsColor.col.g: 255 - 357 = -40%
//   unsteady value: ncsColor.col.b: 36 - 51 = -6%
// here we can select the keys for testing
const tolerance = {
  /*
  w3color: {
    col: {
      red: 6, green: 5, blue: 6,
      hue: 7,
      sat: 2, lightness: 12,
      whiteness: 22, blackness: 7,
    },
  },
  */
  ncsColor: {
    col: {
      r: 6, g: 5, b: 5,
    },
  },
};

// scale tolerance with the difference in degrees
//const upscale_tolerance = 0.5; // 0 <= x <= 1
const upscale_tolerance = 1; // 0 <= x <= 1

function fmtRgb(val) {
  function leftPad3(n) { return ("   " + n).slice(-3); }
  if (val.col.r) return `rgb(${leftPad3(val.col.r)},${leftPad3(val.col.g)},${leftPad3(val.col.b)})`;
  if (val.col.red) return `rgb(${leftPad3(val.col.red)},${leftPad3(val.col.green)},${leftPad3(val.col.blue)})`;
  return 'rgb(?,?,?)';
}

function fmtDiff(diff_100) {
  return (diff_100 > 0 ? '+' : '') + diff_100 + '%';
}



let errors_found = false;

let last = {
  w3color: null,
  ncsColor: null,
};

// loop colors
// full circle (0 to 399) + some extra steps, to check continuity around zero
// extra steps are needed, cos some libraries give no result near the four primary colors (+-10%)
for (let colorDegreesFull = 0; colorDegreesFull <= 420; colorDegreesFull++) {
  const colorDegrees = colorDegreesFull % 400;
  const ncs = '0580-' + ncsOfDegrees(colorDegrees);

  //console.log(`degree ${colorDegrees} / 400 = ncs ${ncs}`);

  let log_added = false;

  const curr = {};
  curr.colorDegrees = colorDegrees;

  curr.w3color = {};
  curr.w3color.colorDegrees = colorDegrees;
  curr.w3color.ncs = ncs;
  curr.w3color.col = w3colorLib(`ncs(${ncs})`);
  if (log_invalid && curr.w3color.col.valid == false) {
    console.log(`w3color: invalid color ${ncs}`)
  }

  curr.ncsColor = {};
  curr.ncsColor.colorDegrees = colorDegrees;
  curr.ncsColor.ncs = ncs;
  curr.ncsColor.rgb = ncsColorLib.rgb('NCS '+ncs);
  let col2 = null;
  if (curr.ncsColor.rgb == null) {
    if (log_invalid) {
      console.log(`ncsColor: no result for NCS ${ncs}. w3color says ${fmtRgb(curr.w3color)}`);
    }
  }
  else {
    const [_, r, g, b] = curr.ncsColor.rgb.match(/rgb\((\d+),(\d+),(\d+)\)/).map(s => parseInt(s));
    curr.ncsColor.col = { r, g, b };

    if (
      log_mismatch && (
      curr.ncsColor.col.r != curr.w3color.col.red ||
      curr.ncsColor.col.g != curr.w3color.col.green ||
      curr.ncsColor.col.b != curr.w3color.col.blue
    )) {
      console.log(`mismatch: degree ${curr.colorDegrees} / 400 = ncs ${ncs}:`);
      console.log(`            last             -> curr (mismatch)`);
      console.log(`  w3color:  ${fmtRgb(last.w3color)} -> ${fmtRgb(curr.w3color)}`);
      console.log(`  ncsColor: ${fmtRgb(last.ncsColor)} -> ${fmtRgb(curr.ncsColor)}`);
      console.log(); // separate output blocks
    }
  }

  // debug
  //if (270 < colorDegrees && colorDegrees < 280) console.dir({ curr }, { depth: null });

  const diff = {};

  // test steadiness of values
  Object.keys(tolerance).forEach(key1 => {
    if (last[key1] == null || curr[key1] == null) return;
    if (key1 == 'w3color' && curr[key1].col.valid == false) return;
    const d1 = last[key1].colorDegrees;
    const d2 = curr[key1].colorDegrees;
    let deg_diff = d2 - d1;
    (key1 in diff) || (diff[key1] = {});
    diff[key1].colorDegrees = { d1, d2 };
    diff[key1].ncs = { n1: last[key1].ncs, n2: curr[key1].ncs };
    Object.keys(tolerance[key1]).forEach(key2 => {
      if (last[key1][key2] == null || curr[key1][key2] == null) return;
      (key2 in diff[key1]) || (diff[key1][key2] = {});
      Object.keys(tolerance[key1][key2]).forEach(key3 => {
        const v1 = last[key1][key2][key3];
        const v2 = curr[key1][key2][key3];
        if (deg_diff < -300 || 300 < deg_diff) {
          deg_diff = deg_diff - Math.sign(deg_diff)*400; // modulo
        }
        const tol_scale = (deg_diff - 1)*(1 + upscale_tolerance) + 1;
        const max = maxval[key1][key2][key3];
        const tol_100 = tolerance[key1][key2][key3];
        let diff_curr = v2 - v1;
        if (key2 == 'col' && key3 == 'hue' && (diff_curr < -300 || 300 < diff_curr)) {
          diff_curr = diff_curr - Math.sign(diff_curr)*360; // modulo
        }
        const diff_100 = Math.round(diff_curr/max * 100);
        const diff_100_scaled = diff_100 / tol_scale;
        diff[key1][key2][key3] = diff_100_scaled;
        const diff_100_abs = Math.abs(diff_100);
        const diff_100_abs_scaled = diff_100_abs / tol_scale;

        // debug
        /*
        if (270 < colorDegrees && colorDegrees < 280 && (key3 == 'red' || key3 == 'green' || key3 == 'blue')) {
          console.log(`test: degree ${d1} -> ${d2} / 400 = ncs ${last[key1].ncs} -> ${curr[key1].ncs}:`);
          console.log(`  last: ${fmtRgb(last[key1])}. ${key1}.${key2}.${key3} = ${v1}`);
          console.log(`  curr: ${fmtRgb(curr[key1])}. ${key1}.${key2}.${key3} = ${v2} = ${(diff_100 > 0 ? `+${diff_100}` : diff_100)}%`);
        }
        */
        if (diff_100_abs_scaled > tol_100) {
          console.log(`unsteady value in library ${key1}:`);
          console.log(`  last: ${d1}/400 = ncs ${last[key1].ncs}: ${fmtRgb(last[key1])}. ${key1}.${key2}.${key3} = ${v1}`);
          console.log(`  curr: ${d2}/400 = ncs ${curr[key1].ncs}: ${fmtRgb(curr[key1])}. ${key1}.${key2}.${key3} = ${v2} = diff ${fmtDiff(diff_100)} (max ${tol_100}%)`);
          log_added = true;
          errors_found = true;
        }


        const tol_dd_scale = 1; // diff_diff tolerance scale factor

        // compare diff to last.diff
        if (last.diff && last.diff[key1] && last.diff[key1][key2] && last.diff[key1][key2][key3]) {
          //console.dir({ last_diff: last.diff }, { depth: null });
          const diff1 = last.diff[key1][key2][key3];
          const diff2 = diff[key1][key2][key3];
          const diff_diff = diff2 - diff1;
          const diff_diff_abs = Math.abs(diff_diff);

          /*
          // debug
          //if (270 < colorDegrees && colorDegrees < 280 && (key3 == 'red' || key3 == 'green' || key3 == 'blue')) {
          if (270 < colorDegrees && colorDegrees < 280 && (key3 == 'blue')) {
            console.log(`test diff_diff: degree ${d1} -> ${d2} / 400 = ncs ${last[key1].ncs} -> ${curr[key1].ncs}:`);
            console.log(`  last: ${key1}.${key2}.${key3} -= ${fmtDiff(last.diff[key1][key2][key3])}`);
            console.log(`  curr: ${key1}.${key2}.${key3} -= ${fmtDiff(diff[key1][key2][key3])}`);
            console.log(`  diff_diff: ${diff_diff}`);
            console.log(`  max_ddiff: ${(tol_100 * tol_scale * tol_dd_scale)}`);
          }
          */


          if (diff_diff_abs > tol_100) {
            //diff[key1].colorDegrees = { d1, d2 };
            console.log(`unsteady diff in library ${key1}:`);
            console.log(`  last: ${last.diff[key1].colorDegrees.d1} -> ${last.diff[key1].colorDegrees.d2} /400 = ${last.diff[key1].ncs.n1} -> ${last.diff[key1].ncs.n2}: ${key1}.${key2}.${key3} -= ${fmtDiff(last.diff[key1][key2][key3])}`);
            console.log(`  curr: ${d1} -> ${d2} /400 = ${last[key1].ncs} -> ${curr[key1].ncs}: ${key1}.${key2}.${key3} -= ${fmtDiff(diff[key1][key2][key3])}' -> diff ${fmtDiff(diff_diff)} (max ${tol_100}%)`);
            log_added = true;
            errors_found = true;
          }
        }

      });
    });
  });

  if (log_added) {
    console.log(); // add newline between degrees
  }

  if (curr.w3color.col.valid == true && curr.ncsColor.rgb != null) {
    last = curr;
  }
  else if (curr.w3color.col.valid == false && curr.ncsColor.rgb != null) {
    // only ncs-color
    last = {
      w3color: last.w3color,
      ncsColor: curr.ncsColor,
    };
  }
  else if (curr.w3color.col.valid == true && curr.ncsColor.rgb == null) {
    // only w3color
    last = {
      w3color: curr.w3color,
      ncsColor: last.ncsColor,
    };
  }
  last.diff = diff;
}

if (errors_found) {
  console.log('errors found :(');
}
else {
  console.log('looking good :)');
}
