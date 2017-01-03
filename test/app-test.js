describe('Blush.App', function() {
  var App, app, spyData;

  beforeEach(function() {
    spyData = {};
    App = Blush.App.extend({});

    App.Views.Welcome = Blush.View.extend({
      config: {
        name: 'hello-world'
      }
    });


    App.Router = Blush.Router.extend({
      start: function() {
        spyData.routerStarted = true;
      }
    });

    app = new App();
  });

  it('when extended has collections for collecting views, viewModels and templates', function() {
    expect(App.ViewModels).toEqual({});
    expect(App.Templates).toEqual({});
  });

  it('initializes with events and a router', function() {
    expect(app.events instanceof Blush.Events).toBe(true);
    expect(app.router instanceof App.Router).toBe(true);
  });

  it('app.start starts the router', function() {
    app.start();
    expect(spyData.routerStarted).toBe(true);
  });
});
