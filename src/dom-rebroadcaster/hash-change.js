Blush.DomRebroadcaster.HashChange = Blush.DomRebroadcaster.extend({
  domEventName:       'hashchange',
  republishEventName: 'data:route',

  rebroadcast: function() {
    var hash = window.location.hash;
    this.publish(this.republishEventName, hash.slice(1));
  }
});
