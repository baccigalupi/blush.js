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
