describe('Blush.BaseClass', function () {
  var NewClass = Blush.BaseClass.extend({
    _initialize() {
      this._initialized = true;
      this._initializedArguments = arguments;
    },

    initialize() {
      this.initialized = true;
      this.initializedArguments = arguments;
    }
  });

  it('initialization calls this._initialize', function () {
    var instance = new NewClass();
    expect(instance._initialized).toBe(true);
  });

  it('initialization calls _initialize with arguments to new', function () {
    var instance = new NewClass('foo', 'bar', 42);
    expect(instance._initializedArguments[0]).toEqual('foo');
    expect(instance._initializedArguments[1]).toEqual('bar');
    expect(instance._initializedArguments[2]).toEqual(42);
  });

  it('initialization calls this.initialize', function () {
    var instance = new NewClass();
    expect(instance.initialized).toBe(true);
  });

  it('initialization calls initialize with arguments to new', function () {
    var instance = new NewClass('foo', 'bar', 42);
    expect(instance.initializedArguments[0]).toEqual('foo');
    expect(instance.initializedArguments[1]).toEqual('bar');
    expect(instance.initializedArguments[2]).toEqual(42);
  });

  it('the instance is of the class that created it', function () {
    var instance = new NewClass();
    expect(instance instanceof NewClass).toBe(true);
  });

  it('inherits many levels deep', function() {
    var ThirdGen = NewClass.extend({
      initialize: function() {
        this.gen = 3;
      }
    });
    var instance = new ThirdGen();

    expect(instance.gen).toEqual(3);
    expect(instance._initialized).toEqual(true);
  });

  it('throws an error if the class is called as a normal function', function () {
    expect(function() {
      NewClass();
    }).toThrow();
  });

  it('knows its constructor', function() {
    var instance = new NewClass();
    expect(instance.constructor).toEqual(NewClass);
  });

  it('does fine without any setup', function() {
    var Klass = Blush.BaseClass.extend();
    expect(function () { new Klass(); }).not.toThrow();
  });
});
