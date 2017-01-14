/* jshint node: true */
/* jslint browser: true */
/* jslint asi: true */
'use strict'

var Two = require('two')
var rbush = require('rbush')
var Turtle = require('./lib/turtle.js')
var arrowhead = require('./lib/arrowHead.js')

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
  vertices.forEach(function (v) { circles.add(two.makeCircle(v.x, v.y, 30)) })
  circles.fill = '#FF8000'
  circles.lineWidth = 5

  // Bulk insert circles bounding boxes in an rtree
  var tree = rbush()
  tree.load(circles.children.map(function (c) {
    var bbox = c.getBoundingClientRect(true)
    return {minX: bbox.left, minY: bbox.top, maxX: bbox.right, maxY: bbox.bottom, shape: c}
  }))

  // Also generate the corresponding two.js path
  var anchors = vertices.map(function (v) { return new Two.Anchor(v.x, v.y) })
  var path = two.makeCurve(anchors, false, true)
  path.noFill().linewidth = 2

  // Display cursor position (in "global group" space, see below)
  // Temporary (ugly lag wrt system cursor)
  var cursor = two.makeCircle(0, 0, 5)
  cursor.fill = '#8aa2fc'

  // Build a global group
  var root = two.makeGroup([circles, path, cursor])
  root.stroke = 'orangered'
  cursor.stroke = '#29568f'

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

  // React to move/touch position
  function onMove (pos) {
    var posInGroupSpace = pos.subSelf(root.translation)
    cursor.translation.copy(posInGroupSpace)
  }
}

