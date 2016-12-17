Blush.View = Blush.BaseClass.extend({
  _initialize: function(opts) {
    opts = opts || {};
    this.app = opts.app;
    this.dom = this.findDom(opts) || document.createElement('div');
    this.initialize.apply(this, arguments);
  },

  render: function() {
    var attachmentMethod = this.attachmentMethod();
    var rendered = this.renderTemplate();
    // TODO: switch to more efficient if test 
    // View.attachmentType.APPEND = 0; // etc
    if (attachmentMethod === 'append') {
      this.dom.innerHTML += rendered;
    } else if (attachmentMethod === 'replace') {
      this.dom.innerHTML = rendered;
    } else {
      this.dom.innerHTML = rendered + this.dom.innerHTML;
    }
  },

  findDom: function(opts) {
    return new Blush.View.DomFinder(this.app, opts.parent, this.parentSelector()).dom();
  },

  renderTemplate: function() {
    return Mario.render(this.template(), this.viewModel());
  },

  template: function() {
    return this.getFromApp('template') || this._defaultConfig['template'];
  },

  viewModel: function() {
    return this.getFromApp('viewModel') || this._defaultConfig['viewModel'];
  },

  parentSelector: function() {
    return this.getConfig('parentSelector') || this._defaultConfig['parentSelector'];
  },

  attachmentMethod: function() {
    return this.getConfig('attachmentMethod') || this._defaultConfig['attachmentMethod'];
  },

  resolveConfig: function() {
    if (this._config) { return; }

    if (this.config && Blush.utils.isFunction(this.config)) {
      this._config = this.config();
    } else if (this.config) {
      this._config = this.config;
    } else {
      this._config = {};
    }
  },

  getFromApp: function(key) {
    if (!this.app) { return; }
    var name = this.getConfig('name');
    if (!name) { return; }
    return this.app[key + 's'][name];
  },

  getConfig: function(type) {
    var value;

    this.resolveConfig();

    if (this._config[type] !== undefined) {
      value = this._config[type];
    } else {
      value = this._defaultConfig[type];
    }

    return value;
  },

  _defaultConfig: {
    viewModel: {},
    template: 'Template not found!',
    attachmentMethod: 'append', // prepend, or replace
    parentSelector: undefined
  }
});

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
