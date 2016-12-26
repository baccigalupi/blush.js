Blush.Config = Blush.BaseClass.extend({
  _initialize: function(config, klass, app) {
    this.defaultConfig = klass.defaultConfig;
    this.config = config;
    this.app = app;
    this.appClass = app.constructor;
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
    if (!this.appClass) { return; }

    var name = this.get('name');
    if (!name) { return; }

    var collectionName = key + 's';
    collectionName = collectionName.replace(/^[a-z]/i, function(character) {
      return character.toUpperCase();
    });
    var value = this.appClass[collectionName] && this.appClass[collectionName][name];
    if (value === undefined) {
      value = this.defaultConfig[key];
    }

    return value;
  }
});
