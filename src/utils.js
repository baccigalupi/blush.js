Blush.utils.typeOf = function typeOf(value) {
  var output = Object.prototype.toString.call(value);
  var matches = output.match(/\[object (.*)\]/);
  return matches && matches[1];
};

['String', 'Array', 'Object', 'Date', 'RegExp', 'Number', 'Function', 'Null', 'Undefined', 'Boolean'].forEach(function(type) {
  Blush.utils['is' + type] = function isA(value) {
    return Blush.utils.typeOf(value) === type;
  };
});

Blush.utils.isNil = function isNil(value) {
  return Blush.utils.isUndefined(value) || Blush.utils.isNull(value);
};

Blush.utils.camelize = function camelize(word) {
  return word.replace(/([_\-]\w)/g, function (g) {
    return g[1].toUpperCase();
  });
};

Blush.utils.capitalize = function capitalize(word) {
  return word.replace(/^[a-z]/, function(c) {
    return c.toUpperCase();
  });
};

Blush.utils.classify = function classify(word) {
  return Blush.utils.capitalize(Blush.utils.camelize(word));
};
