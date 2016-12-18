describe('Blush.View', function() {
  var app, View, view;

  beforeEach(function() {
    app = {
      templates: {'hello-world': '<h1>hello {{type}} world</h1>'},
      viewModels: {'hello-world': {type: 'sulking'}}
    };
  });

  describe('basic rendering', function() {
    it('when initialized with an app, will store it for use it with the configured name to render', function() {
      View = Blush.View.extend({
        config: {
          name: 'hello-world'
        }
      });

      view = new View({app: app});
      expect(view.app).toBe(app);

      view.render();
      expect(view.dom.innerHTML).toBe('<h1>hello sulking world</h1>');
    });
  });

  describe('rendering into a parent, attachment method', function() {
    it('will append to the parent by default', function() {
      View = Blush.View.extend({
        config: {
          name: 'hello-world'
        }
      });

      var parent = document.createElement('div');
      parent.innerHTML = '<a href="#hey">Don\'t go away</a>\n';
      view = new View({app: app, parent: parent});
      expect(view.app).toBe(app);
      view.render();
      expect(view.dom.innerHTML).toBe('<a href="#hey">Don\'t go away</a>\n<h1>hello sulking world</h1>');
    });

    it('will prepend to the parent when configured', function() {
      View = Blush.View.extend({
        config: {
          name: 'hello-world',
          renderVia: 'prepend'
        }
      });

      var parent = document.createElement('div');
      parent.innerHTML = '<a href="#hey">Don\'t go away</a>\n';
      view = new View({app: app, parent: parent});
      expect(view.app).toBe(app);
      view.render();
      expect(view.dom.innerHTML).toBe('<h1>hello sulking world</h1><a href="#hey">Don\'t go away</a>\n');
    });

    it('will replace the innerHTML of the parent when configured', function() {
      View = Blush.View.extend({
        config: {
          name: 'hello-world',
          renderVia: 'replace'
        }
      });

      var parent = document.createElement('div');
      parent.innerHTML = '<a href="#hey">Don\'t go away</a>\n';
      view = new View({app: app, parent: parent});
      expect(view.app).toBe(app);
      view.render();
      expect(view.dom.innerHTML).toBe('<h1>hello sulking world</h1>');
    });
  });

  describe('parent selector', function() {
    it('when not found will default to attaching to parent', function() {
      View = Blush.View.extend({
        config: {
          name: 'hello-world',
          selector: '.not-here'
        }
      });

      var parent = document.createElement('div');
      parent.innerHTML = '<a href="#hey">Don\'t go away</a>\n';
      view = new View({app: app, parent: parent});
      expect(view.app).toBe(app);
      view.render();
      expect(view.dom.innerHTML).toBe('<a href="#hey">Don\'t go away</a>\n<h1>hello sulking world</h1>');
    });

    it('when found will go into that parent element', function() {
      View = Blush.View.extend({
        config: {
          name: 'hello-world',
          selector: 'a',
          renderVia: 'replace'
        }
      });

      var parent = document.createElement('div');
      parent.innerHTML = '<a href="#hey">Don\'t go away</a>\n';
      view = new View({app: app, parent: parent});
      expect(view.app).toBe(app);
      view.render();
      expect(parent.innerHTML).toBe('<a href="#hey"><h1>hello sulking world</h1></a>\n');
    });
  });
});
