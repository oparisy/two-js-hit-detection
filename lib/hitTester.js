/* jshint node: true */
/* jslint browser: true */
/* jslint asi: true */
'use strict'

var rbush = require('rbush')

/** A wrapper for two.js shapes hit testing */
module.exports = HitTester

function HitTester () {
  this._tree = rbush()
}

/** Efficiently add a collection of two.js shapes (augmented with a geom property) to the hit tester */
HitTester.prototype.load = function (shapes) {
  this._tree.load(shapes.map(function (shape) {
    shape.hit = buildHitFunction(shape)
    var bbox = shape.getBoundingClientRect(true) // "true" since we want local space coordinates
    return {minX: bbox.left, minY: bbox.top, maxX: bbox.right, maxY: bbox.bottom, shape: shape}
  }))
}

/** Return intersected shapes at this position (in the same space as load) */
HitTester.prototype.hit = function (pos) {
  var candidates = this._tree.search({minX: pos.x, minY: pos.y, maxX: pos.x, maxY: pos.y})
  var selected = candidates.filter(function (c) { return c.shape.hit(pos) })
  return selected.map(function (r) { return r.shape })
}

/** Build an hit function for this shape */
function buildHitFunction (shape) {
  if (shape.geom.kind === 'circle') {
    return circleHit(shape.geom.x, shape.geom.y, shape.geom.r)
  }

  throw new Error('Unhandled kind of shape')
}

/** Return an "hit function" for a circle */
function circleHit (x, y, r) {
  var rsq = r * r
  return function (pos) {
    var dx = pos.x - x
    var dy = pos.y - y
    return (dx * dx + dy * dy) <= rsq
  }
}
