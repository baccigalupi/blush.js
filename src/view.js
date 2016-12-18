Blush.View = Blush.BaseClass.extend({
  _initialize: function(opts) {
    opts = opts || {};
    this.app = opts.app;
    this.dom = this.findDom(opts) || document.createElement('div');
  },

  render: function() {
    var renderVia = this.renderVia();
    var rendered = this.renderTemplate();
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
    return this.getFromApp('template') || Blush.View.defaultConfig['template'];
  },

  viewModel: function() {
    return this.getFromApp('viewModel') || Blush.View.defaultConfig['viewModel'];
  },

  selector: function() {
    return this.getConfig('selector');
  },

  renderVia: function() {
    return this.getConfig('renderVia');
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
