/* jshint node: true */
/* jslint browser: true */
/* jslint asi: true */
'use strict'

/** A basic deterministic L-System */
module.exports = LSystem

/** "axiom" is a string, "productionRules" a character => replacement map */
function LSystem (axiom, productionRules) {
  this.currentState = axiom
  this.rules = productionRules
}

/** Perform one rewriting step */
LSystem.prototype.iterate = function () {
  var acc = ''
  for (var i = 0, len = this.currentState.length; i < len; i++) {
    var chr = this.currentState.charAt(i)
    var replacement = this.rules[chr]
    acc += (replacement !== undefined) ? replacement : chr
  }
  this.currentState = acc
}

/** Get the currently generated string */
LSystem.prototype.state = function () {
  return this.currentState
}
