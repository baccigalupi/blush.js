describe('Blush.View', function() {
  var templates;

  beforeEach(function() {
    templates = {
      'hello-world': '<h1>hello {{type}} world</h1>'
    };
  });

  it('given a template string will render into a local dom', function() {
    var View = Blush.View.extend({
      config: function() {
        this.template = templates['hello-world'];
      }
    });
    var view = new View();
    view.render();
    expect(view.dom.innerHTML).toBe('<h1>hello  world</h1>');
  });

  it('given a view model, it will use it in the rendering', function() {
    var View = Blush.View.extend({
      config: function() {
        this.template = '<h1>hello {{type}} world</h1>';
        this.viewModel = {
          type: 'cruel'
        };
      }
    });

    var view = new View();
    view.render();
    expect(view.dom.innerHTML).toBe('<h1>hello cruel world</h1>');
  });
});
