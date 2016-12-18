Blush.View = Blush.BaseClass.extend({
  _initialize: function(opts) {
    opts = opts || {};
    this.app = opts.app;
    this.dom = this.findDom(opts) || document.createElement('div');
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
    return this.getFromApp('template') || Blush.View.defaultConfig['template'];
  },

  viewModel: function() {
    return this.getFromApp('viewModel') || Blush.View.defaultConfig['viewModel'];
  },

  parentSelector: function() {
    return this.getConfig('parentSelector');
  },

  attachmentMethod: function() {
    return this.getConfig('attachmentMethod');
  },

  getFromApp: function(key) {
    if (!this.app) { return; }
    var name = this.getConfig('name');
    if (!name) { return; }
    return this.app[key + 's'][name];
  },

  getConfig: function(type) {
    var value;

    if (this.config[type] !== undefined) {
      value = this.config[type];
    } else {
      value = Blush.View.defaultConfig[type];
    }

    return value;
  }
});

Blush.View.defaultConfig = {
  viewModel: {},
  template: 'Template not found!',
  attachmentMethod: 'append', // prepend, or replace
  parentSelector: undefined
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
