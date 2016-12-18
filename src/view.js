Blush.View = Blush.BaseClass.extend({
  _initialize: function(opts) {
    opts = opts || {};
    this.app = opts.app;
    this._config = new Blush.View.Config(this.config, Blush.View, this.app);
    this.dom = this.findDom(opts) || document.createElement('div');
  },

  render: function() {
    var renderVia = this._config.renderVia();
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
    return new Blush.View.DomFinder(this.app, opts.parent, this._config.selector()).dom();
  },

  renderTemplate: function() {
    return Mario.render(this._config.template(), this._config.viewModel());
  }
});

Blush.View.defaultConfig = {
  viewModel: {},
  template: 'Template not found!',
  renderVia: 'append', // prepend, or replace
  selector: undefined
};


Blush.View.Config = Blush.Config.extend({
  template: function() {
    return this.getFromApp('template');
  },

  viewModel: function() {
    return this.getFromApp('viewModel');
  },

  selector: function() {
    return this.get('selector');
  },

  renderVia: function() {
    return this.get('renderVia');
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
