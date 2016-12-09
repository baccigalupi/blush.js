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
    return scanner;
  },

  delimiters: ['{{', '}}'],
  cache: {},
  isFunction: function isLambda(value) {
    return Object.prototype.toString.call(value) === '[object Function]';
  }
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
  var tail = this.template.slice(this.cursor);
  var nextTagLocation = tail.indexOf(this.delimiter());
  var nextCursor, nextPart;

  if (nextTagLocation === -1) {
    nextPart   = tail;
    nextCursor = this.outOfRange;
  } else {
    nextPart   = tail.slice(0, nextTagLocation);
    nextCursor = this.cursor + 2 + nextTagLocation;
  }

  if (this.delimiterIndex) {
    this.orchestrateDisassemblies(nextPart);
  } else {
    this.disassembly().addText(nextPart);
  }

  this.cursor = nextCursor;
  this.flipDelimiter();
};

Mario.Scanner.prototype.orchestrateDisassemblies = function orchestrateDisassemblies(nextPart) {
  var tag = new Mario.Tag(nextPart);
  var currentDisassembly = this.disassembly();
  if (tag.type === 'section' || tag.type === 'antiSection') {
    this.startSection(tag);
  } else if (tag.type === 'closing' && tag.name === currentDisassembly.key) {
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

Mario.Scanner.prototype.flipDelimiter = function flipDelimiter() {
  this.delimiterIndex = (this.delimiterIndex + 1) % 2;
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
  return content.join('');
};

Mario.Variable = function(key, view) {
  this.key = key;
  this.view = view;
  this.value = view[key];
  if (key === '.') { this.value = view; }
};

Mario.Variable.prototype.evaluate = function evaluate() {
  if (this.isComplexKey()) {
    this.nestedValue();
  }

  if (Mario.isFunction(this.value)) {
    this.lambdaValue();
  } else {
    this.stripFalseyValues();
  }
  return this.value;
};

Mario.Variable.prototype.isComplexKey = function isComplexKey() {
  if (this.key === '.') { return false; }
  var keys = this.key.split('.');
  this.complexKey = keys;
  return !!(keys.length - 1);
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

Mario.Variable.prototype.isLambda = function isLambda() {
  return Object.prototype.toString.call(this.value) === '[object Function]';
};

Mario.Variable.prototype.lambdaValue = function lambdaValue() {
  this.value = this.value();
  this.stripFalseyValues();
};

Mario.Variable.prototype.stripFalseyValues = function stripFalseyValues() {
  if (!this.value && this.value !== 0) {
    this.value = '';
  }
};

Mario.Tag = function(name, index) {
  this.index = index;
  this.name = name.replace(/\s/g, '');
  this.separateTypeFromName();
};

Mario.Tag.prototype.separateTypeFromName = function separateTypeFromName() {
  this.type = this.determineType();
  if (this.type !== 'evaluation') {
    this.name = this.name.slice(1);
  }
};

Mario.Tag.prototype.determineType = function determineType() {
  return {
    '>': 'partial',
    '#': 'section',
    '^': 'antiSection',
    '/': 'closing'
  }[this.name[0]] || 'evaluation';
};

Mario.Tag.prototype.render = function renderTag(view, partials) {
  var rendered;
  if (this.type === 'partial') {
    rendered = this.partial(view, partials);
  } else if (this.type === 'section') {
    rendered = this.section(view, partials);
  } else if (this.type === 'antiSection') {
    rendered = this.antiSection(view, partials);
  } else {
    rendered = this.evaluation(view);
  }
  return rendered;
};

Mario.Tag.prototype.evaluation = function evaluation(view) {
  return new Mario.Variable(this.name, view).evaluate();
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
  return content.join('');
};

Mario.Tag.prototype.antiSection = function renderAntiSection(fullView, partials) {
  var view = this.sectionView(fullView, partials);
  if (view) { return ''; }
  return this.disassembly.render(fullView, partials);
};

Mario.Disassembly = function(key) {
  this.key = key;
  this.texts = [];
  this.tags = [];
};

Mario.Disassembly.prototype.addText = function addText(text) {
  this.texts.push(text);
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
  return content.join('');
};

Mario.Disassembly.prototype.substitute = function substituteTagContent(content, tag, view, partials) {
  content[tag.index] = tag.render(view, partials);
};

global.Mario = Mario;
})(this);