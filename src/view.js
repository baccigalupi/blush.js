Blush.View = Blush.BaseClass.extend({
  _initialize: function() {
    this.dom = document.createElement(this.getConfig('tag'));
    this.initialize.apply(this, arguments);
  },

  renderTemplate: function() {
    return Mario.render(this.getConfig('template'), this.viewModel());
  },

  viewModel: function() {
    return this.getConfig('viewModel');
  },

  render: function() {
    this.dom.innerHTML = this.renderTemplate();
  },

  getConfig: function(type) {
    var value;
    if (this.config && this.config[type] !== undefined) {
      value = this.config[type];
    } else {
      value = this._config[type];
    }
    return value;
  },

  _config: {
    tag: 'div',
    viewModel: {},
    template: ''
  }
});
