Blush.Events = Blush.BaseClass.extend({
  __initialize: function() {
    this.callbacks = {};
  },

  on: function(eventName, callback) {
    this.callbacks[eventName] || (this.callbacks[eventName] = []);
    this.callbacks[eventName].push(callback);
    return callback;
  },

  trigger: function() {
    var args = Array.prototype.slice.call(arguments);
    var eventName = args[0];
    this.callbacks[eventName].forEach(function(callback) {
      callback.apply(callback, args);
    });
  }
});
