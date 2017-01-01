Blush.Route = Blush.BaseClass.extend({
  initialize: function(app, matcher, viewName) {
    this.app = app;
    this.Views = app.constructor.Views;
    this.matcher  = matcher;
    this.viewName = viewName;
    this.paramNames = [];
    this.disassembleMatchers();
  },

  disassembleMatchers: function() {
    var matcher = this.matcher;
    if ( matcher.split(':').length === 1 &&
         matcher.split('*').length === 1) {
      this.isSimple = true;
    } else {
      this.matcherRegex = this.convertMatcher();
    }
  },

  namedParam: /(\(\?)?:\w+/g,
  splatParam: /\*\w+/g,

  // NOTE from backbone, license MIT
  convertMatcher: function() {
    var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    var self = this;
    var route = this.matcher
              .replace(escapeRegExp, '\\$&')
              .replace(this.namedParam, function(key) {
                self.paramNames.push(key.slice(1));
                return '([^/?]+)';
              })
              .replace(this.splatParam, function(key) {
                self.paramNames.push(key.slice(1));
                return '([^?]*?)';
              });
    return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
  },

  match: function(route) {
    if (this.isSimple) { return route === this.matcher; }
    return this.matcherRegex.test(route);
  },

  ViewClass: function() {
    if (this._ViewClass) { return this._ViewClass; }

    var Views = this.Views;
    var viewClassName, config, ViewClass;

    for (viewClassName in Views) {
      config = Views[viewClassName].prototype.config || {};
      if (config.name === this.viewName) {
        ViewClass = Views[viewClassName];
        this._ViewClass = ViewClass;
        return ViewClass;
      }
    }
  },

  render: function(route) {
    var ViewClass = this.ViewClass();
    if (!ViewClass) { return; }

    var params = this.extractParams(route);
    var view =  new ViewClass({app: this.app, params: params});
    view.render();
  },

  extractParams: function(route) {
    var params = {route: route};
    if (this.isSimple) { return params; }

    var self = this;
    var values = this.matcherRegex.exec(route).slice(1);
    values.forEach(function(value, i) {
      if (!value) { return; }
      params[self.paramNames[i]] = value;
    });

    return params;
  }
});
