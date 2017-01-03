describe('Blush.Route', function() {
  var route, app, rendered;

  beforeEach(function() {
    app = {
      klass: {
        Views: {
          HelloWorld: Blush.View.extend({
            config: {name: 'hello-world'},
            render: function() {
              rendered = true;
            }
          })
        }
      }
    };
  });

  describe('matching', function() {
    it('works when the matcher is a simple string', function() {
      route = new Blush.Route(app, 'welcome/friends', 'hello-world');
      expect(route.match('welcome/friends')).toBe(true);
      expect(route.match('welcome/enemies')).toBe(false);
    });

    it('matches routes with a param', function() {
      route = new Blush.Route(app, 'welcome/:name', 'hello-world');
      expect(route.match('welcome/friends')).toBe(true);
      expect(route.match('welcome/enemies')).toBe(true);
      expect(route.match('welcome')).toBe(false);
      expect(route.match('welcome-it')).toBe(false);
    });

    it('matches routes with many params', function() {
      route = new Blush.Route(app, 'programs/:program_id/tasks/:task_id', 'task-show');
      expect(route.match('programs/12/tasks/24')).toBe(true);
      expect(route.match('programs/12/tasks')).toBe(false);
      expect(route.match('programs/12')).toBe(false);
      expect(route.match('programs')).toBe(false);
    });

    it('matches routes with two params per url division', function() {
      route = new Blush.Route(app, ':page-:section/:id', 'task-show');
      expect(route.match('32.7-a42/foo-23')).toBe(true);
      expect(route.match('something/else')).toBe(false);
    });

    it('matches routes with splats', function() {
      route = new Blush.Route(app, 'page/*page', 'task-show');
      expect(route.match('page/what-in-the-world/2016-12-28')).toBe(true);
      expect(route.match('page/13')).toBe(true);
      expect(route.match('pages/13')).toBe(false);
    });

    it('matches routes with params and splats', function() {
      route = new Blush.Route(app, 'page/:category/*details', 'task-show');
      expect(route.match('page/funkyard/what-in-the-world/2016-12-28')).toBe(true);
      expect(route.match('page/13')).toBe(false);
    });
  });

  describe('extractingParams', function() {
    it('with a simple string, just presents the route information', function() {
      route = new Blush.Route(app, 'welcome/friends', 'hello-world');
      expect(route.extractParams('welcome/friends')).toEqual({route: 'welcome/friends'});
    });

    it('returns a param', function() {
      route = new Blush.Route(app, 'welcome/:name', 'hello-world');
      expect(route.extractParams('welcome/friends')).toEqual({
        route: 'welcome/friends',
        name: 'friends'
      });
      expect(route.extractParams('welcome/countrymen')).toEqual({
        route: 'welcome/countrymen',
        name: 'countrymen'
      });
    });

    it('returns many params', function() {
      route = new Blush.Route(app, 'programs/:program_id/tasks/:task_id', 'task-show');
      expect(route.extractParams('programs/12/tasks/24')).toEqual({
        route: 'programs/12/tasks/24',
        program_id: '12',
        task_id: '24'
      });
    });

    it('determines params when there are two params per url division', function() {
      route = new Blush.Route(app, ':page-:section/:id', 'task-show');
      expect(route.extractParams('32.7-a42/foo-23')).toEqual({
        route: '32.7-a42/foo-23',
        page: '32.7',
        section: 'a42',
        id: 'foo-23'
      });
    });

    it('returns correctly splat params', function() {
      route = new Blush.Route(app, 'page/*page', 'task-show');
      expect(route.extractParams('page/what-in-the-world/2016-12-28')).toEqual({
        route: 'page/what-in-the-world/2016-12-28',
        page: 'what-in-the-world/2016-12-28'
      });
      expect(route.extractParams('page/13')).toEqual({
        route: 'page/13',
        page: '13'
      });
    });

    it('finds both named params and splats', function() {
      route = new Blush.Route(app, 'page/:category/*details', 'task-show');
      expect(route.extractParams('page/funkyard/what-in-the-world/2016-12-28')).toEqual({
        route: 'page/funkyard/what-in-the-world/2016-12-28',
        category: 'funkyard',
        details: 'what-in-the-world/2016-12-28'
      });
    });
  });

  // This is really a different responsibility, that will be needed in other places too
  // more on that later ...
  describe('finding views', function() {
    it('finds the class via the configured name', function() {
      route = new Blush.Route(app, 'page/*page', 'static-pages');
      expect(route.ViewClass()).toBe(undefined);
      route = new Blush.Route(app, 'welcome/friends', 'hello-world');
      expect(route.ViewClass()).toBe(app.klass.Views.HelloWorld);
    });
  });

  describe('render', function() {
    it('calls render on the view', function() {
      route = new Blush.Route(app, 'page/*page', 'static-pages');
      expect(route.ViewClass()).toBe(undefined);
      route = new Blush.Route(app, 'welcome/friends', 'hello-world');
      route.render();
      expect(rendered).toBe(true);
    });
  });
});
