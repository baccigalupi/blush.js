Blush.ViewModel = Blush.BaseClass.extend({
  _initialize: function(opts) {
    opts = opts || {};
    var app = opts.app || {};
    this.data = app.data && app.data();
    this.initialize.apply(this, arguments);
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
    this.addEscapedAttributes();
    //this.addUnescapedAttributes();
    return this.json;
  },

  addEscapedAttributes: function () {
    this.attributes.forEach(function(name) {
      this.json[name] = this.escapedValueFor(name);
    }.bind(this));
  },

  escapedValueFor: function(name) {
    var value = this.valueFor(name);
    return Blush.utils.escapeHTML(value);
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
