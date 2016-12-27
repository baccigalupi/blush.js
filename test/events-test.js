describe('Blush.Events', function() {
  it('a callback can be added to the event manager for a given event name', function(done) {
    var events = new Blush.Events();
    events.on('data', function(eventName, arg1, arg2, arg3) {
      expect(arg1).toEqual({foo: 'bar'});
      expect(arg2).toEqual({baz: 'zardov'});
      expect(arg3).toBe(undefined);
      done();
    });
    events.trigger('data', {foo: 'bar'}, {baz: 'zardov'});
  });

  //it('Callbacks can be added ONCE to event manager', function() {
    //expect(1);
    //var events = new Blush.Events();
    //events.one('click', function() {
      //ok(true, 'Event fired');
    //});
    //events.trigger('click');
    //events.trigger('click');
  //});

  //it('The event stores the results', function() {
    //var events = new Blush.Events(),
      //evt;
    //events.on('click', function() {
      //return 'A';
    //});
    //events.on('click', function() {
      //return 'B';
    //});
    //evt = events.trigger('click');
    //deepEqual(evt.results, ['A', 'B'], 'Event stores the results')
  //});

  //it('Blush.Events can be used as functional mixin', function() {
    //expect(1);
    //var obj = {};
    //Blush.Events.apply(obj);
    //obj.on('name', function() {
      //equal(this, obj, 'Event was executed in the context of the object');
    //});
    //obj.trigger('name');
  //});

  //it('Events can be trigger as instances of Event', function() {
    //expect(2);
    //var events = new Blush.Events(),
      //evt = new Event('name');
    //events.on('name', function() {
      //ok(true, 'Event was executed');
      //return 'A';
    //});
    //events.trigger(evt);
    //deepEqual(evt.results, ['A'], 'The event object stores the result');
  //});

  //it('Namespaced events are executed', function() {
    //expect(2);
    //var events = new Blush.Events();
    //events.on('name.subname', function() {
      //return 'A';
    //});
    //events.on('name.subname_a', function() {
      //return 'G';
    //});
    //events.on('name.subname.deepsubname', function() {
      //return 'C';
    //});
    //events.on('name', function() {
      //return 'B';
    //});
    //deepEqual(events.trigger('name.subname.deepsubname').results, ['C'], 'Namespaced event was executed');
    //deepEqual(events.trigger('name').results, ['B', 'A', 'C', 'G'], 'Non-namespaced event included the sub-events');
  //});
});
