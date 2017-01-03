describe('Blush.BaseClass', function () {
  var spyData, NewClass, ThirdGen;

  beforeEach(function() {
    spyData = {};
    NewClass = Blush.BaseClass.extend({
      _initialize() {
        spyData._initialized = true;
        spyData._initializedArguments = arguments;
      },

      initialize() {
        spyData.initialized = true;
        spyData.initializedArguments = arguments;
      },

      write: function() {
        spyData.writeClass = 'NewClass';
      }
    });

    ThirdGen = NewClass.extend({
      initialize: function() {
        spyData.gen = 3;
      },

      write: function() {
        spyData.writeClass = 'ThirdGen';
      },

      movingOn: true
    });
  });

  it('initialization calls this._initialize', function () {
    new NewClass();
    expect(spyData._initialized).toBe(true);
  });

  it('initialization calls _initialize with arguments to new', function () {
    new NewClass('foo', 'bar', 42);
    expect(spyData._initializedArguments[0]).toEqual('foo');
    expect(spyData._initializedArguments[1]).toEqual('bar');
    expect(spyData._initializedArguments[2]).toEqual(42);
  });

  it('initialization calls this.initialize', function () {
    new NewClass();
    expect(spyData.initialized).toBe(true);
  });

  it('initialization calls initialize with arguments to new', function () {
    new NewClass('foo', 'bar', 42);
    expect(spyData.initializedArguments[0]).toEqual('foo');
    expect(spyData.initializedArguments[1]).toEqual('bar');
    expect(spyData.initializedArguments[2]).toEqual(42);
  });

  it('the instance is of the class that created it', function () {
    var instance = new NewClass();
    expect(instance instanceof NewClass).toBe(true);
  });

  it('inherits many levels deep', function() {
    var instance = new ThirdGen();
    instance.write();

    expect(spyData.gen).toEqual(3);
    expect(spyData._initialized).toEqual(true);
    expect(spyData.writeClass).toEqual('ThirdGen');
  });

  it('throws an error if the class is called as a normal function', function () {
    expect(function() {
      NewClass();
    }).toThrow();
  });

  it('knows its creating klass (constructor gets overwritter sadly)', function() {
    var instance = new ThirdGen();
    expect(instance.klass).toEqual(ThirdGen);
  });

  it('does fine without any setup', function() {
    var Klass = Blush.BaseClass.extend();
    expect(function () { new Klass(); }).not.toThrow();
  });
});
