Blush.ViewModel = Blush.BaseClass.extend({
  _initialize: function(opts) {
    opts = opts || {};
    var app = opts.app || {};
    this.data = app.data && app.data();
    this.initialize.apply(this, arguments);
  },

  json: function() {
    var json = {};
    var attributes = (this.attributes || []);
    var length = attributes.length;
    var i, attributeName, camelAttributeName, local;
    for (i = 0; i < length; i++) {
      attributeName = attributes[i];
      camelAttributeName = Blush.utils.camelize(attributeName);
      local = this[attributeName] || this[camelAttributeName];
      if (local !== undefined && Blush.utils.isFunction(local)) {
        local = local();
      }
      json[attributeName] = local || this.data[attributeName];
    }
    return json;
  }
});
