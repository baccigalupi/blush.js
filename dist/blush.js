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

Blush.polyfills.arrayFind = function arrayFind (iterator) {
  var length = this.length;
  var i, element, value;

  for (i = 0; i < length; i++) {
    element = this[i];
    value = iterator(element, i, this);
    if (value) { return element; }
  }
};

Array.prototype.find = Array.prototype.find || Blush.polyfills.arrayFind;

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

Blush.utils.functionBind = function functionBind(context) {
  var func = this;
  return function() {
    return func.apply(context, arguments);
  };
};

Function.prototype.bind = Function.prototype.bind || Blush.utils.functionBind;

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

Blush.BaseClass.extend = function extend(attrs) {
  var ParentClass = this;
  var ChildClass  = Blush.createConstructor();

  var proto = {};
  proto = Blush.BaseClass.mixProto(proto, ParentClass.prototype);
  proto = Blush.BaseClass.mixProto(proto, attrs);

  ChildClass.prototype = proto;
  ChildClass.prototype.contstructor = ChildClass;
  ChildClass.prototype.klass        = ChildClass;
  ChildClass.extend = extend;

  return ChildClass;
};

Blush.BaseClass.mixProto = function mixProto(origProto, attrs) {
  var proto = Object.assign({}, origProto);
  var attr;

  for (var attr in attrs) {
    if ( attr.match(/prototype|__proto__|superclass|constructor/) ) { continue; }
    proto[attr] = attrs[attr];
  }

  return proto;
};

Blush.Config = Blush.BaseClass.extend({
  _initialize: function(config, defaultConfig, app) {
    this.defaultConfig = defaultConfig;
    this.config = config;
    this.app = app;
    this.appClass = app.klass;
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
    if (!this.appClass || !name) { return this.defaultConfig[key]; }

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
});

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
    this._config = new Blush.Config(this.config, Blush.View.defaultConfig, this.app);
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
    this.dom    = document.querySelector(this.selector);
    this.events = new Blush.Events();
    this.router = new this.klass.Router(this, this.events);
  },

  start: function() {
    this.router.start();
  },

  selector: '.application-container'
});

Blush.App.Views = {};
Blush.App.ViewModels = {};
Blush.App.Templates = {};

Blush.App.extend = function(attrs) {
  var App = Blush.BaseClass.extend.call(this, attrs);
  App.Views       = {};
  App.ViewModels  = {};
  App.Templates   = {};
  return App;
};

Blush.Events = Blush.BaseClass.extend({
  __initialize: function() {
    this.callbacks = {};
  },

  on: function(eventName, callback) {
    this.callbacks[eventName] || (this.callbacks[eventName] = []);
    this.callbacks[eventName].push(callback);
    return callback;
  },

  trigger: function() {
    var args = Array.prototype.slice.call(arguments);
    var eventName = args[0];
    var callbacks = this.callbacks[eventName] || [];
    callbacks.forEach(function(callback) {
      callback.apply(callback, args);
    });
  }
});

Blush.Route = Blush.BaseClass.extend({
  initialize: function(app, matcher, viewName) {
    this.app = app;
    this.Views = app.klass.Views;
    this.matcher  = matcher;
    this.viewName = viewName;
    this.paramNames = [];
    this.disassembleMatchers();
  },

  disassembleMatchers: function() {
    var matcher = this.matcher;
    if ( matcher.split(':').length === 1 &&
         matcher.split('*').length === 1) {
      this.isSimple = true;
    } else {
      this.matcherRegex = this.convertMatcher();
    }
  },

  namedParam: /(\(\?)?:\w+/g,
  splatParam: /\*\w+/g,

  // NOTE from backbone, license MIT
  convertMatcher: function() {
    var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    var self = this;
    var route = this.matcher
              .replace(escapeRegExp, '\\$&')
              .replace(this.namedParam, function(key) {
                self.paramNames.push(key.slice(1));
                return '([^/?]+)';
              })
              .replace(this.splatParam, function(key) {
                self.paramNames.push(key.slice(1));
                return '([^?]*?)';
              });
    return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
  },

  match: function(route) {
    if (this.isSimple) { return route === this.matcher; }
    return this.matcherRegex.test(route);
  },

  ViewClass: function() {
    if (this._ViewClass) { return this._ViewClass; }

    var Views = this.Views;
    var viewClassName, config, ViewClass;

    for (viewClassName in Views) {
      config = Views[viewClassName].prototype.config || {};
      if (config.name === this.viewName) {
        ViewClass = Views[viewClassName];
        this._ViewClass = ViewClass;
        return ViewClass;
      }
    }
  },

  render: function(route) {
    var ViewClass = this.ViewClass();
    if (!ViewClass) { return; }

    var params = this.extractParams(route);
    var view =  new ViewClass({app: this.app, params: params});
    view.render();
  },

  extractParams: function(route) {
    var params = {route: route};
    if (this.isSimple) { return params; }

    var self = this;
    var values = this.matcherRegex.exec(route).slice(1);
    values.forEach(function(value, i) {
      if (!value) { return; }
      params[self.paramNames[i]] = value;
    });

    return params;
  }
});

Blush.Router = Blush.BaseClass.extend({
  _initialize: function(app, events) {
    this.events = events;
    this.app = app;
  },

  start: function() {
    this.routeSet = new Blush.Router.LoadRoutes(this.app, this.routes).run();
    this.listenForUrlChanges();
    this.events.on('data:route', this.route.bind(this));
    this.onStart();
  },

  listenForUrlChanges: function() {
    throw new Error('implement me: listenForUrlChanges in Router');
    //new Blush.DomRebroadcaster.HashChange(this.events, window);
    //new Blush.DomRebroadcaster.PopStateChange(this.events, window);
  },

  onStart: function() {
    // this should really be part of the data store, default state
    // and route data should pull from data.route instead of finding it;
    var startingRoute = window.location.hash.slice(1) || 'welcome';
    this.events.trigger('data:route', startingRoute);
    //this.events.trigger('data:route', this.data('route'));
  },

  route: function(eventName, matcher) {
    if (!this.routeSet) { return; }

    var foundRoute = this.routeSet.find(function(route) {
      return route.match(matcher);
    });

    if (foundRoute) { foundRoute.render(); }
  }
});

Blush.Router.LoadRoutes = Blush.BaseClass.extend({
  initialize: function(app, routeMap) {
    this.app = app;
    this.routeMap = routeMap;
    this.set = [];
  },

  run: function() {
    var matcher;
    var routeMap = this.routeMap;
    for (matcher in routeMap) {
      this.addRoute(matcher);
    }
    return this.set;
  },

  addRoute: function(matcher) {
    var viewName = this.routeMap[matcher];
    var route = new Blush.Route(this.app, matcher, viewName);
    this.set.push(route);
  }
});

Blush.DomRebroadcaster = Blush.BaseClass.extend({
  _initialize: function(events, dom) {
    this.events = events;
    this.dom = dom;
    this.listener = this.rebroadcast.bind(this);
    this.dom.addEventListener(this.domEventName, this.listener);
  },

  /*
   * Subclasses must set attributes:
   *    'domEventName'
   *    'republishEventName'
   */

  rebroadcast: function() {
    throw new Error('Implement me, and also "domEventName" and "republishEventName"');
    // this.publish(this.republishEventName, SOME_DATA_HERE);
  },

  publish: function() {
    this.events.trigger.apply(this.events, arguments);
  }
});

Blush.DomRebroadcaster.HashChange = Blush.DomRebroadcaster.extend({
  domEventName:       'hashchange',
  republishEventName: 'data:route',

  rebroadcast: function() {
    var hash = window.location.hash;
    this.publish(this.republishEventName, hash.slice(1));
  }
});


global.Blush = Blush;
})(this);