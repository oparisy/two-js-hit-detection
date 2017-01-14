/* jshint node: true */
/* jslint browser: true */
/* jslint asi: true */
'use strict'

/** A basic deterministic L-System */
module.exports = sierpinskiArrowheadCurve

/** Generate a Sierpiński arrowhead curve
 * (see https://en.wikipedia.org/wiki/Sierpi%C5%84ski_arrowhead_curve) */
function sierpinskiArrowheadCurve (order, length, turtle) {
  var baseAngle = Math.PI / 3
    // If order is even we can just draw the curve.
  if ((order % 2) === 0) {
    curve(order, length, +baseAngle)
  } else /* order is odd */ {
    turtle.turn(+baseAngle)
    curve(order, length, -baseAngle)
  }

  function curve (order, length, angle) {
    if (order === 0) {
      turtle.drawLine(length)
    } else {
      curve(order - 1, length / 2, -angle)
      turtle.turn(+angle)
      curve(order - 1, length / 2, +angle)
      turtle.turn(+angle)
      curve(order - 1, length / 2, -angle)
    }
  }
}
