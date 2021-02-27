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

  it('does not create outliers', function () {
    const tolerance = 6
    Array.from({ length: 420 })
      .map(function (_, index) {
        const colorDegrees = index % 400
        return 'NCS S 0580-' + ncsOfDegrees(colorDegrees)
      })
      .map(function (ncsValue) {
        return { name: ncsValue, rgb: ncs.rgb(ncsValue) }
      })
      .forEach(function (current, index, list) {
        var next = list[index + 1]
        if (!current.rgb || !next || !next.rgb) {
          return true
        }

        const [currentR, currentG, currentB] = parseRGB(current.rgb)
        const [nextR, nextG, nextB] = parseRGB(next.rgb)
        if (distance(currentR, nextR) > tolerance) {
          throw new Error(`Outlier found for "${current.name}". R values: ${currentR}, ${nextR}`)
        }
        if (distance(currentG, nextG) > tolerance) {
          throw new Error(`Outlier found for "${current.name}". G values: ${currentG}, ${nextG}`)
        }
        if (distance(currentB, nextB) > tolerance) {
          throw new Error(`Outlier found for "${current.name}". B values: ${currentB}, ${nextB}`)
        }
      })

    function distance (a, b) {
      return (Math.abs(b - a) / 255) * 100
    }

    function parseRGB (val) {
      const [, R, G, B] = val.match(/rgb\((\d+),(\d+),(\d+)\)/).map(s => parseInt(s, 10))
      return [R, G, B]
    }

    function ncsOfDegrees (d) {
      if (d === 0) return 'R' // red
      if (d < 100) return 'R' + d + 'B' // red-blue
      if (d === 100) return 'B' // blue
      if (d < 200) return 'B' + (-100 + d) + 'G' // blue-green
      if (d === 200) return 'G' // green
      if (d < 300) return 'G' + (-200 + d) + 'Y' // green-yellow
      if (d === 300) return 'Y' // yellow
      if (d < 400) return 'Y' + (-300 + d) + 'R' // yellow-red
      if (d <= 400) return 'R' // red
    }
  })
})
