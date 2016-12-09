describe('Blush.View', function() {
  var app, View, view;

  it('given a template string literal', function() {
    View = Blush.View.extend({
      config: {
        template: '<h1>hello {{type}} world</h1>'
      }
    });

    view = new View();
    view.render();

    expect(view.dom.innerHTML).toBe('<h1>hello  world</h1>');
  });

  it('given a template string literal and a literal object as the view model', function() {
    View = Blush.View.extend({
      config: {
        template: '<h1>hello {{type}} world</h1>',
        viewModel: {type: 'cruel'}
      }
    });

    view = new View();
    view.render();

    expect(view.dom.innerHTML).toBe('<h1>hello cruel world</h1>');
  });

  it('given a template attached to an app object not yet in scope', function() {
    View = Blush.View.extend({
      config: function () {
        return {
          template: app.templates['hello-world']
        };
      }
    });

    app = {
      templates: {'hello-world': '<h1>hello {{type}} world</h1>'},
      viewsModels: {}
    };

    view = new View();
    view.render();

    expect(view.dom.innerHTML).toBe('<h1>hello  world</h1>');
  });

  it('given a template attached to an app object not yet in scope', function() {
    View = Blush.View.extend({
      config: function () {
        return {
          template: app.templates['hello-world'],
          viewModel: app.viewModels['hello-world']
        };
      }
    });

    app = {
      templates: {'hello-world': '<h1>hello {{type}} world</h1>'},
      viewModels: {'hello-world': {type: 'happy'}}
    };

    view = new View();
    view.render();

    expect(view.dom.innerHTML).toBe('<h1>hello happy world</h1>');
  });

  it('when initialized with an app, will store it for use it with the configured name to render', function() {
    View = Blush.View.extend({
      config: {
        name: 'hello-world'
      }
    });
    app = {
      templates: {'hello-world': '<h1>hello {{type}} world</h1>'},
      viewModels: {'hello-world': {type: 'sulking'}}
    };
    view = new View({app: app});
    expect(view.app).toBe(app);
    view.render();
    expect(view.dom.innerHTML).toBe('<h1>hello sulking world</h1>');
  });

  it('when initialized with a parent, will append to the parent', function() {
    View = Blush.View.extend({
      config: {
        name: 'hello-world'
      }
    });
    app = {
      templates: {'hello-world': '<h1>hello {{type}} world</h1>'},
      viewModels: {'hello-world': {type: 'sulking'}}
    };
    var parent = document.querySelector('.test-dom-space');
    view = new View({app: app, parent: parent});
    expect(view.app).toBe(app);
    view.render();
    expect(view.dom.innerHTML).toBe('<h1>hello sulking world</h1>');
    parent.innerHTML = '';
  });
});
