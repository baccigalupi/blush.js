Blush.App = Blush.BaseClass.extend({
  _initialize: function() {
    this.dom    = document.querySelector(this.selector);
    this.events = new Blush.Events();
    this.router = new this.klass.Router(this, this.events);
  },

  start: function() {
    this.router.start();
  },

  selector: '.application-container'
});

Blush.App.Views = {};
Blush.App.ViewModels = {};
Blush.App.Templates = {};

Blush.App.extend = function(attrs) {
  var App = Blush.BaseClass.extend.call(this, attrs);
  App.Views       = {};
  App.ViewModels  = {};
  App.Templates   = {};
  return App;
};
