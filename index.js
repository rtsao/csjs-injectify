'use strict';

var through = require('through2');
var acorn = require('acorn');
var falafel = require('falafel');

var regex = /(['"`])csjs\1/;

module.exports = function (file) {
  var output = through(function(buf, enc, next) {
    var source = buf.toString('utf8');

    try {
      var injectified = falafel(source, {
        parser: acorn,
        ecmaVersion: 6,
        sourceType: 'module'
      }, walk);
    } catch (err) {
      return error(err)
    }

    this.push(injectified);
    next();
  });

  function error(msg) {
    var err = typeof msg === 'string' ? new Error(msg) : msg;
    output.emit('error', err);
  }

  return output;
};

function walk(node){
  if (node.type === 'ImportDeclaration') {
    node.update(node.source().replace(regex, '$1csjs-inject$1'))
  } else if (isRequire(node)) {
    if (node.arguments[0].value === 'csjs') {
      var quote = node.arguments[0].raw[0][0];
      node.arguments[0].update(quote + 'csjs-inject' + quote);
    }
  }
}

function isRequire(node) {
  return node.callee &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require';
}
