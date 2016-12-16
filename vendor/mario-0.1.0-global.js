(function(global) {
'use strict';
var Mario = {
  render: function(template, view, partials) {
    var scanner = this.compile(template);
    return scanner.render(view, partials);
  },

  compile: function(template) {
    var scanner = this.cache[template];
    if (!scanner) {
      scanner = new Mario.Scanner(template);
      this.cache[template] = scanner;
    }
    scanner.compile();
    return scanner;
  },

  delimiters: ['{{', '}}', '}}}'],
  cache: {}
};

Mario.Scanner = function(template) {
  this.template       = template;
  this.disassemblies  = [new Mario.Disassembly()];

  this.cursor         = 0;
  this.delimiterIndex = 0;
  this.compiled       = false;
  this.outOfRange     = this.template.length + 1;
};

Mario.Scanner.prototype.compile = function compile() {
  if (this.compiled) { return; }

  var length = this.outOfRange - 1;
  while (this.cursor < length) {
    this.processToken();
  }

  this.compiled = true;
};

Mario.Scanner.prototype.processToken = function processToken() {
  var tail            = this.template.slice(this.cursor);
  var nextTagLocation = tail.indexOf(Mario.delimiters[this.delimiterIndex]);

  this.extractNextToken(tail, nextTagLocation);
  this.addToken();
  this.advanceCursor(nextTagLocation);

  if (nextTagLocation >= 0) {
    this.flipDelimiter(tail);
  }
};

Mario.Scanner.prototype.extractNextToken = function extractNextToken(tail, location) {
  if (location === undefined || location === -1) {
    this.nextToken = tail;
  } else {
    this.nextToken = tail.slice(0, location);
  }
};

Mario.Scanner.prototype.addToken = function addToken() {
  if (this.delimiterIndex > 0) { // start of tag found, seeking ending
    this.orchestrateDisassemblies();
  } else {
    this.addText();
  }
};

Mario.Scanner.prototype.advanceCursor = function advanceCursor(nextTagLocation) {
  if (nextTagLocation >= 0) {
    this.cursor = this.cursor + Mario.delimiters[this.delimiterIndex].length + nextTagLocation;
  } else {
    this.cursor = this.outOfRange;
  }
};

Mario.Scanner.prototype.addText = function() {
  this.disassembly().addText(this.nextToken);
};

Mario.Scanner.prototype.orchestrateDisassemblies = function orchestrateDisassemblies() {
  var tag = new Mario.Tag(this.nextToken);
  var currentDisassembly = this.disassembly();
  if (tag.type === 2 || tag.type === 3) {
    this.startSection(tag);
  } else if (tag.type === 4 && tag.name === currentDisassembly.key) {
    this.endSection();
  } else {
    currentDisassembly.addTag(tag);
  }
};

Mario.Scanner.prototype.startSection = function startSection(tag) {
  var disassembly = new Mario.Disassembly(tag.name);
  disassembly.addTag(tag);
  this.disassemblies.push(disassembly);
};

Mario.Scanner.prototype.endSection = function endSection() {
  var disassembly = this.disassemblies.pop();
  var baseTag = disassembly.tags[0];
  disassembly.tags = disassembly.tags.slice(1);
  baseTag.disassembly = disassembly;
  this.disassembly().addTag(baseTag);
};

Mario.Scanner.prototype.disassembly = function disassembly() {
  return this.disassemblies[this.disassemblies.length - 1];
};

Mario.Scanner.prototype.delimiter = function delimiter() {
  return Mario.delimiters[this.delimiterIndex];
};

Mario.Scanner.prototype.flipDelimiter = function flipDelimiter(tail) {
  if (this.delimiterIndex === 2 || this.delimiterIndex === 1) {
    this.delimiterIndex = 0;
  } else {
    this.delimiterIndex = 1;
  }

  if (this.delimiterIndex === 1 && this.nextToken === '' && tail[2] === '{') {
    this.delimiterIndex = 2;
  }
};

Mario.Scanner.prototype.render = function render(view, partials) {
  this.compile();
  view = view || {};
  partials = partials || {};
  var content = [];
  var length = this.disassemblies.length;
  var i;
  for (i = 0; i < length; i++) {
    content.push(this.disassemblies[i].render(view, partials));
  }
  return String.prototype.concat.apply('', content);
};

Mario.Disassembly = function(key) {
  this.key = key;
  this.texts = [];
  this.tags = [];
};

Mario.Disassembly.prototype.addText = function addText(text) {
  if (text.length) { this.texts.push(text); }
};

Mario.Disassembly.prototype.addTag = function addTag(tag) {
  tag.index = this.texts.length;
  this.tags.push(tag);
  this.texts.push('');
};

Mario.Disassembly.prototype.render = function renderDisassembly(view, partials) {
  var content  = this.texts.slice(0);
  var tagLength = this.tags.length;
  var i;
  for (i = 0; i < tagLength; i++) {
    this.substitute(content, this.tags[i], view, partials);
  }
  return String.prototype.concat.apply('', content);
};

Mario.Disassembly.prototype.substitute = function substituteTagContent(content, tag, view, partials) {
  content[tag.index] = tag.render(view, partials);
};

Mario.Variable = function(key, view) {
  this.key = key;
  this.view = view;
  this.value = view[key];
  if (key === '.') { this.value = view; }
};

Mario.Variable.prototype.evaluate = function evaluate() {
  if (this.isComplexKey()) { this.nestedValue(); }
  this.stripFalseyValues();
  return this.value;
};

Mario.Variable.prototype.isComplexKey = function isComplexKey() {
  if (this.key === '.') { return false; }
  var keys = this.key.split('.');
  this.complexKey = keys;
  return keys.length - 1 ? true : false;
};

Mario.Variable.prototype.nestedValue = function nestedValue() {
  var length = this.complexKey.length;
  var i;
  var temp = this.view;
  for (i = 0; i < length; i++) {
    if (temp) {
      temp = temp[this.complexKey[i]];
    }
  }
  this.value = temp;
};

Mario.Variable.prototype.stripFalseyValues = function stripFalseyValues() {
  if (!this.value && this.value !== 0) {
    this.value = '';
  }
};

function evaluate(key, view) {
  var value = view[key];
  var isComplex;
  var keys = [];

  if (key === '.') {
    value = view;
    isComplex = false;
  } else {
    keys = key.split('.');
    isComplex = keys.length - 1 ? true : false;
  }

  if (isComplex) {
    var length = keys.length;
    var i;
    var temp = view;
    for (i = 0; i < length; i++) {
      if (temp) {
        temp = temp[keys[i]];
      }
    }
    value = temp;
  }

  if (!value && value !== 0) {
    value = '';
  }
  return value;
}

Mario.Tag = function(name, index) {
  this.index = index;
  this.name = name.replace(/\s/g, '');
  this.separateTypeFromName();
};

Mario.Tag.prototype.separateTypeFromName = function separateTypeFromName() {
  this.type = this.determineType();
  if (this.type !== 6) {
    this.name = this.name.slice(1);
  }
};

Mario.Tag.prototype.determineType = function determineType() {
  return {
    '>': 1,
    '#': 2,
    '^': 3,
    '/': 4,
    '{': 5
  }[this.name[0]] || 6;
};

Mario.Tag.prototype.render = function renderTag(view, partials) {
  var rendered;
  if (this.type === 1) {
    rendered = this.partial(view, partials);
  } else if (this.type === 2) {
    rendered = this.section(view, partials);
  } else if (this.type === 3) {
    rendered = this.antiSection(view, partials);
  } else if (this.type === 5) {
    rendered = this.evaluation(view);
  } else {
    rendered = this.escapedEvaluation(view);
  }
  return rendered;
};

Mario.Tag.prototype.evaluation = function evaluation(view) {
  //return new Mario.Variable(this.name, view).evaluate();
  return evaluate(this.name, view);
};

Mario.Tag.prototype.escapedEvaluation = function escapedEvaluation(view) {
  //var value = new Mario.Variable(this.name, view).evaluate();
  var value = evaluate(this.name, view);
  return this.escape(value);
};

Mario.Tag.prototype.partial = function renderPartial(view, partials) {
  var partial = partials[this.name];
  var rendeded;
  if (partial) {
    rendeded = Mario.render(partial, view, partials);
  }
  return rendeded || '';
};

Mario.Tag.prototype.sectionView = function sectionView(fullView, partials) {
  var view = this.evaluation(fullView, partials);
  if (Array.isArray(view) && !view.length) { return false; }
  return view;
};

Mario.Tag.prototype.section = function renderSection(fullView, partials) {
  var view = this.sectionView(fullView, partials);
  if (!view) { return ''; }
  var content;
  if (Array.isArray(view)) {
    content = this.renderArraySection(view, partials);
  } else {
    content = this.disassembly.render(view, partials);
  }
  return content;
};

Mario.Tag.prototype.renderArraySection = function renderArraySection(view, partials) {
  var content = [];
  var length = view.length;
  var i;
  for (i = 0; i < length; i++) {
    content.push(this.disassembly.render(view[i], partials));
  }
  return String.prototype.concat.apply('', content);
};

Mario.Tag.prototype.antiSection = function renderAntiSection(fullView, partials) {
  var view = this.sectionView(fullView, partials);
  if (view) { return ''; }
  return this.disassembly.render(fullView, partials);
};

// Stolen mostly from Mustache.js!
Mario.Tag.prototype.escape = function escapeHTML(value) {
  if (value.toString) {
    value = value.toString();
  }

  return String(value).replace(Mario.Tag.escapeRegex, Mario.Tag.escape);
};

Mario.Tag.escapeRegex = /[&<>"'`=\/]/g;
Mario.Tag.escapeMap = {
  '&':  '&amp;',
  '<':  '&lt;',
  '>':  '&gt;',
  '"':  '&quot;',
  '\'': '&#39;',
  '/':  '&#x2F;',
  '`':  '&#x60;',
  '=':  '&#x3D;'
};
Mario.Tag.escape = function escape(value) {
  return Mario.Tag.escapeMap[value];
};

global.Mario = Mario;
})(this);