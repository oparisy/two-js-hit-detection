/* jshint node: true */
/* jslint browser: true */
/* jslint asi: true */
'use strict'

var Two = require('two')
var Turtle = require('./lib/turtle.js')
var arrowhead = require('./lib/arrowHead.js')
var HitTester = require('./lib/hitTester.js')

var NOT_HIT_COLOR = '#FF8000'
var HIT_COLOR = '#991100'

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
  circles.fill = NOT_HIT_COLOR
  circles.lineWidth = 5

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

  // Build a spatial index
  var hitTester = new HitTester()
  hitTester.load(circles.children)

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
    var touch = e.changedTouches[0]
    onMove(new Two.Vector(touch.pageX, touch.pageY))
    return false
  })

  // React to move/touch position
  var lastHit = []
  function onMove (pos) {
    // Search for hits at that position (in local/group space)
    var gpos = pos.subSelf(root.translation)
    var hitShapes = hitTester.hit(gpos)

    // Update elements style accordingly
    lastHit.forEach(function (e) {
      e.fill = NOT_HIT_COLOR
    })
    hitShapes.forEach(function (e) {
      e.fill = HIT_COLOR
    })
    lastHit = hitShapes
  }

  /** Apply the required translation to "group" so that it is centered in this Two instance */
  function center (group) {
    var bbox = group.getBoundingClientRect(true)
    var bboxCenter = new Two.Vector(bbox.left + bbox.width / 2, bbox.top + bbox.height / 2)
    var delta = new Two.Vector(two.width / 2, two.height / 2).subSelf(bboxCenter)
    group.translation = delta
  }
}
