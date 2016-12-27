(function(global) {
'use strict';
var Blush = {};
Blush.polyfills = {};
Blush.utils = {};

Blush.polyfills.arrayForEach = function arrayForEach(iterator) {
  var length = this.length;
  var i, element;
  for (i = 0; i < length; i++) {
    element = this[i];
    iterator(element, i, this);
  }
};

Array.prototype.forEach = Array.prototype.forEach || Blush.polyfills.arrayForEach;

Blush.polyfills.objectAssign = function() {
  var target = arguments[0];
  var current, key, argumentIndex;

  for (argumentIndex = 1; argumentIndex < arguments.length; argumentIndex++) {
		current = arguments[argumentIndex];
    for (key in current) {
      if (current.hasOwnProperty(key)) {
        target[key] = current[key];
      }
    }
	}

	return target;
};

Object.assign = Object.assign || Blush.polyfills.objectAssign;

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

Blush.createConstructor = function() {
  var klass = function klass() {
    if (!(this instanceof klass)) {
      throw new Error('This is a class, and cannot be called without the new keyword.');
    }
    this.__initialize.apply(this, arguments);
  };
  return klass;
};

Blush.BaseClass = Blush.createConstructor();

Blush.BaseClass.prototype.__initialize = function () {
  this._initialize.apply(this, arguments);
  this.initialize.apply(this, arguments);
};

Blush.BaseClass.prototype._initialize = function () {};
Blush.BaseClass.prototype.initialize = function () {};

Blush.BaseClass.extend = function extend() {
  var parentClass = this;
  var childClass  = Blush.createConstructor();
  var extensions = Array.prototype.slice.call(arguments);
  extensions.unshift(parentClass.prototype);
  extensions.unshift(childClass.prototype);
  Object.assign.apply(null, extensions);
  childClass.prototype.constructor = childClass;
  childClass.extend = extend;
  return childClass;
};

Blush.Config = Blush.BaseClass.extend({
  _initialize: function(config, klass, app) {
    this.defaultConfig = klass.defaultConfig;
    this.config = config;
    this.app = app;
    this.appClass = app.constructor;
  },

  get: function(key) {
    if (this['_' + key] !== undefined) { return this['_' + key];}

    var value;
    if (this.config[key] !== undefined) {
      value = this.config[key];
    } else {
      value = this.defaultConfig[key];
    }

    this['_' + key] = value;
    return value;
  },

  getFromApp: function(key) {
    var name = this.get('name');
    if (!this.appClass || !name) { return; }

    var collection = this.appCollection(key);
    var value = collection[name] || collection[Blush.utils.classify(name)];
    if (value === undefined) {
      value = this.defaultConfig[key];
    }

    return value;
  },

  appCollection: function(key) {
    var collectionName = key + 's';
    collectionName = Blush.utils.capitalize(collectionName);
    return this.appClass[collectionName] || {};
  }
});

Blush.ViewModel = Blush.BaseClass.extend({
  _initialize: function(opts) {
    opts = opts || {};
    var app = opts.app || {};
    this.data = app.data && app.data();
  },

  json: function() {
    return new Blush.ViewModel.ExtractJSON(this).run();
  }
}, Blush.utils);

Blush.ViewModel.ExtractJSON = Blush.BaseClass.extend({
  _initialize: function(viewModel) {
    this.json                 = {};
    this.viewModel            = viewModel;
    this.data                 = viewModel.data;
    this.attributes           = viewModel.attributes || [];
    this.unescapedAttributes  = viewModel.unescapedAttributes || [];
  },

  run: function() {
    this.addAttributes();
    return this.json;
  },

  addAttributes: function () {
    this.attributes.forEach(function(name) {
      this.json[name] = this.valueFor(name);
    }.bind(this));
  },

  valueFor: function(name) {
    var camelName = Blush.utils.camelize(name);
    var local = this.viewModel[name] || this.viewModel[camelName];
    if (local !== undefined && Blush.utils.isFunction(local)) {
      local = local();
    }
    return local || this.data[name];
  }
});

Blush.View = Blush.BaseClass.extend({
  _initialize: function(opts) {
    opts = opts || {};
    this.app = opts.app;
    this._config = new Blush.Config(this.config, Blush.View, this.app);
    this.dom = this.findDom(opts) || document.createElement('div');
  },

  render: function() {
    var renderVia = this.renderVia();
    var rendered  = this.renderTemplate();
    // TODO: switch to more efficient if test 
    // View.attachmentType.APPEND = 0; // etc
    if (renderVia === 'append') {
      this.dom.innerHTML += rendered;
    } else if (renderVia === 'replace') {
      this.dom.innerHTML = rendered;
    } else {
      this.dom.innerHTML = rendered + this.dom.innerHTML;
    }
  },

  findDom: function(opts) {
    return new Blush.View.DomFinder(this.app, opts.parent, this.selector()).dom();
  },

  renderTemplate: function() {
    return Mario.render(this.template(), this.viewModel());
  },

  template: function() {
    return this._config.getFromApp('template');
  },

  viewModel: function() {
    var viewModelClass = this.viewModelClass();
    return new viewModelClass({app: this.app}).json();
  },

  viewModelClass: function() {
    return this._config.getFromApp('viewModel');
  },

  selector: function() {
    return this._config.get('selector');
  },

  renderVia: function() {
    return this._config.get('renderVia');
  }
});

Blush.View.defaultConfig = {
  viewModel: function() {
    return {
      json: function() { return {}; }
    };
  },
  template: 'Template not found!',
  renderVia: 'append', // prepend, or replace
  selector: undefined
};


Blush.View.DomFinder = Blush.BaseClass.extend({
  _initialize: function(app, parentDom, selector) {
    this.app = app;
    this.parentDom = parentDom;
    this.selector = selector;
  },

  parent: function() {
    return this.parentDom || this.app.dom;
  },

  dom: function() {
    var parent = this.parent();
    if (!this.selector) { return parent; }
    var found = parent.querySelector(this.selector);
    return found || parent;
  }
});

Blush.App = Blush.BaseClass.extend({
  _initialize: function() {
    this.dom = document.querySelector(this.selector);
  },

  selector: '.application-container'
});

Blush.App.Views = {};
Blush.App.ViewModels = {};
Blush.App.Templates = {};

Blush.App.extend = function() {
  var App = Blush.BaseClass.extend.apply(this, arguments);
  App.Views       = {};
  App.ViewModels  = {};
  App.Templates   = {};
  return App;
}


global.Blush = Blush;
})(this);