Blush.utils.typeOf = function typeOf(value) {
  var output = Object.prototype.toString.call(value);
  var matches = output.match(/\[object (.*)\]/);
  return matches && matches[1];
};

['String', 'Array', 'Object', 'Date', 'Regex', 'Number', 'Function', 'Null', 'Undefined', 'Boolean'].forEach(function(type) {
  Blush.utils['is' + type] = function isA(value) {
    return Blush.utils.typeOf(value) === type;
  };
});

Blush.utils.isNil = function isNil(value) {
  return Blush.utils.isUndefined(value) || Blush.utils.isNull(value);
};

Blush.utils.camelize = function camelize(word) {
  return word.replace(/(_\w)/g, function (g) {
    return g[1].toUpperCase();
  });
};

Blush.utils.escapeHTML = function escapeHTML(text) {
  if (!Blush.utils.isString(text)) { return text; }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return String(text).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
    return entityMap[s];
  });
};
