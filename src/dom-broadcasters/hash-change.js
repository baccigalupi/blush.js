Blush.DomBroadcasters.HashChange = Blush.BaseClass.extend({
  _initialize: function(events, dom) {
    this.events = events;
    this.dom = dom;
    this.listener = this.rebroadcast.bind(this);
    this.dom.addEventListener(this.domEventName, this.listener);
  },

  domEventName:       'hashchange',
  republishEventName: 'data:route',

  rebroadcast: function() {
    var hash = window.location.hash;
    this.publish(this.republishEventName, hash.slice(1));
  },

  publish: function() {
    this.events.trigger.apply(this.events, arguments);
  }
});
