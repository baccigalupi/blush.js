Blush.Config = Blush.BaseClass.extend({
  _initialize: function(config, defaultConfig, app) {
    this.defaultConfig = defaultConfig;
    this.config = config;
    this.app = app;
    this.appClass = app.klass;
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
    var name = this.get('name');
    if (!this.appClass || !name) { return this.defaultConfig[key]; }

    var collection = this.appCollection(key);
    var value = collection[name] || collection[Blush.utils.classify(name)];
    if (value === undefined) {
      value = this.defaultConfig[key];
    }

    return value;
  },

  appCollection: function(key) {
    var collectionName = key + 's';
    collectionName = Blush.utils.capitalize(collectionName);
    return this.appClass[collectionName] || {};
  }
});
