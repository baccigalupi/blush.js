describe('Blush.DomRebroadcaster.HashChange', function() {
  it('rebroadcasts a "data:route" event to the publisher when it gets a change event', function(done) {
    var events = new Blush.Events();

    events.on('data:route', function(eventName, route) {
      var hash = window.location.hash;
      expect(route).toEqual(hash.slice(1));
      done();
    });

    new Blush.DomRebroadcaster.HashChange(events, window);

    window.location.hash = 'change-' + Math.floor(Math.random() * 10000);
  });
});
