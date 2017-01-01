Blush.Router = Blush.BaseClass.extend({
  _initialize: function(app, events) {
    this.events = events;
    this.app = app;
  },

  start: function() {
    this.routeSet = new Blush.Router.LoadRoutes(this.app, this.routes).run();
    this.listenForUrlChanges();
    this.events.on('data:route', this.route.bind(this));
    this.onStart();
  },

  listenForUrlChanges: function() {
    throw new Error('implement me: listenForUrlChanges in Router');
    //new Blush.DomRebroadcaster.HashChange(this.events, window);
    //new Blush.DomRebroadcaster.PopStateChange(this.events, window);
  },

  onStart: function() {
    // this should really be part of the data store, default state
    // and route data should pull from data.route instead of finding it;
    var startingRoute = window.location.hash.slice(1) || 'welcome';
    this.events.trigger('data:route', startingRoute);
    //this.events.trigger('data:route', this.data('route'));
  },

  route: function(eventName, matcher) {
    if (!this.routeSet) { return; }

    var foundRoute = this.routeSet.find(function(route) {
      return route.match(matcher);
    });

    if (foundRoute) { foundRoute.render(); }
  }
});

Blush.Router.LoadRoutes = Blush.BaseClass.extend({
  initialize: function(app, routeMap) {
    this.app = app;
    this.routeMap = routeMap;
    this.set = [];
  },

  run: function() {
    var matcher;
    var routeMap = this.routeMap;
    for (matcher in routeMap) {
      this.addRoute(matcher);
    }
    return this.set;
  },

  addRoute: function(matcher) {
    var viewName = this.routeMap[matcher];
    var route = new Blush.Route(this.app, matcher, viewName);
    this.set.push(route);
  }
});
