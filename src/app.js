Blush.App = Blush.BaseClass.extend({
  _initialize: function() {
    this.dom = document.querySelector(this.selector);
  },

  selector: '.application-container'
});

Blush.App.Views = {};
Blush.App.ViewModels = {};
Blush.App.Templates = {};

Blush.App.extend = function() {
  var App = Blush.BaseClass.extend.apply(this, arguments);
  App.Views       = {};
  App.ViewModels  = {};
  App.Templates   = {};
  return App;
}
