Blush.View = Blush.BaseClass.extend({
  _initialize: function(opts) {
    opts = opts || {};
    this.app = opts.app;
    this.dom = opts.parent || document.createElement('div');
    this.initialize.apply(this, arguments);
  },

  renderTemplate: function() {
    return Mario.render(this.template(), this.viewModel());
  },

  template: function() {
    return this.getFromApp('template') || this.getConfig('template');
  },

  viewModel: function() {
    return this.getFromApp('viewModel') || this.getConfig('viewModel');
  },

  render: function() {
    this.dom.innerHTML = this.renderTemplate();
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
    attachment: 'append' // prepend, or replace
  }
});
