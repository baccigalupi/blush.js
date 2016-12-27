describe('Blush.App', function() {
  it('when extended has collections for collecting views, viewModels and templates', function() {
    var App = Blush.App.extend();
    expect(App.Views).toEqual({});
    expect(App.ViewModels).toEqual({});
    expect(App.Templates).toEqual({});
  });
});
