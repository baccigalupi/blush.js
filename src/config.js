Blush.Config = Blush.BaseClass.extend({
  _initialize: function(config, klass, app) {
    this.defaultConfig = klass.defaultConfig;
    this.config = config;
    this.app = app;
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
    if (!this.app) { return; }
    var name = this.get('name');
    if (!name) { return; }
    var value = this.app[key + 's'][name];
    if (value === undefined) {
      value = this.defaultConfig[key];
    }
    return value;
  }
});
