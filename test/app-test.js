describe('Blush.App', function() {
  var App, app;

  beforeEach(function() {
    App = Blush.App.extend({});

    App.Views.Welcome = Blush.View.extend({
      config: {
        name: 'hello-world'
      }
    });

    App.Router = Blush.Router.extend({});

    app = new App();
  });

  it('when extended has collections for collecting views, viewModels and templates', function() {
    expect(App.ViewModels).toEqual({});
    expect(App.Templates).toEqual({});
  });
});
