Blush.DomRebroadcaster = Blush.BaseClass.extend({
  _initialize: function(events, dom) {
    this.events = events;
    this.dom = dom;
    this.listener = this.rebroadcast.bind(this);
    this.dom.addEventListener(this.domEventName, this.listener);
  },

  /*
   * Subclasses must set attributes:
   *    'domEventName'
   *    'republishEventName'
   */

  rebroadcast: function() {
    throw new Error('Implement me, and also "domEventName" and "republishEventName"');
    // this.publish(this.republishEventName, SOME_DATA_HERE);
  },

  publish: function() {
    this.events.trigger.apply(this.events, arguments);
  }
});
