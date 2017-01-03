describe('Blush.Router', function() {
  var Router, router, events, app, spyData;

  beforeEach(function() {
    spyData = {};
    events = new Blush.Events();
    app = {
      klass: {
        Views: {
          HelloWorld: Blush.View.extend({
            config: { name: 'hello-world'},
            render: function() {
              spyData.renderCalled = true;
            }
          })
        }
      }
    };

    Router = Blush.Router.extend({
      routes: {
        'welcome': 'hello-world'
      },

      listenForUrlChanges: function() {
        // no-op
      }
    });

    router = new Router(app, events);
  });

  it('does not listen for route changes before starting', function() {
    events.trigger('data:route', 'welcome');
    expect(spyData.renderCalled).not.toEqual(true);
  });

  it('starts listening after being started', function() {
    router.start();
    events.trigger('data:route', 'welcome');
    expect(spyData.renderCalled).toEqual(true);
  });
});
