/* jshint node: true */
/* jslint browser: true */
/* jslint asi: true */
'use strict'

var Two = require('two')
var rbush = require('rbush')
var Turtle = require('./lib/turtle.js')
var arrowhead = require('./lib/arrowHead.js')

var UNSELECTED_COLOR = '#FF8000'
var SELECTED_COLOR = '#991100'

main()

function main () {
  // Set up a Canvas renderer (to demonstrate we have no DOM support)
  var two = new Two({ type: Two.Types.canvas, fullscreen: true, autostart: true })
  two.appendTo(document.body)

  // Emit curve vertices
  var turtle = new Turtle(0, 0, 0)
  arrowhead(4, 600, turtle)

  // Generate a corresponding two.js set of shapes
  var vertices = turtle.getVertices()
  var circles = two.makeGroup()
  vertices.forEach(function (v) {
    var c = two.makeCircle(v.x, v.y, 30)
    c.hit = circleHit(v.x, v.y, 30)
    circles.add(c)
  })
  circles.fill = UNSELECTED_COLOR
  circles.lineWidth = 5

  // Bulk insert circles bounding boxes in a spatial index
  var tree = rbush()
  tree.load(circles.children.map(function (c) {
    var bbox = c.getBoundingClientRect(true)
    return {minX: bbox.left, minY: bbox.top, maxX: bbox.right, maxY: bbox.bottom, shape: c}
  }))

  // Also generate the corresponding two.js path
  var anchors = vertices.map(function (v) { return new Two.Anchor(v.x, v.y) })
  var path = two.makeCurve(anchors, false, true)
  path.noFill().linewidth = 2

  // Build a global group
  var root = two.makeGroup([circles, path])
  root.stroke = 'orangered'

  // Center it (and ensure we stay centered)
  center(root)
  two.bind('resize', function () {
    center(root)
  })

  // Apply the required translation to "group" so that it is centered in this Two instance
  function center (group) {
    var bbox = group.getBoundingClientRect(true)
    var bboxCenter = new Two.Vector(bbox.left + bbox.width / 2, bbox.top + bbox.height / 2)
    var delta = new Two.Vector(two.width / 2, two.height / 2).subSelf(bboxCenter)
    group.translation.copy(delta)
  }

  // Keep track of mouse/touch position
  document.addEventListener('mousemove', function (e) {
    onMove(new Two.Vector(e.clientX, e.clientY))
  })
  document.addEventListener('touchstart', function (e) {
    e.preventDefault()
    return false
  })
  document.addEventListener('touchmove', function (e) {
    e.preventDefault()
    var touch = e.originalEvent.changedTouches[0]
    onMove(new Two.Vector(touch.pageX, touch.pageY))
    return false
  })

  var lastSelected = []

  // React to move/touch position
  function onMove (pos) {
    // Compute position in group space
    var gpos = pos.subSelf(root.translation)

    // Search for candidates at that position in spatial index
    var candidates = tree.search({minX: pos.x, minY: pos.y, maxX: pos.x, maxY: pos.y})
    var selected = candidates.filter(function (c) { return c.shape.hit(gpos) })

    // Update selected elements style
    lastSelected.forEach(function (e) {
      e.shape.fill = UNSELECTED_COLOR
    })
    selected.forEach(function (e) {
      e.shape.fill = SELECTED_COLOR
    })
    lastSelected = selected
  }
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
