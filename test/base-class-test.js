describe('Blush.BaseClass', function () {
  var NewClass = Blush.BaseClass.extend({
    initialize() {
      this.initialized = true;
      this.initializedArguments = arguments;
    }
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
      gen: 3
    });
    var instance = new ThirdGen();

    expect(instance.gen).toEqual(3);
    expect(instance.initialized).toEqual(true);
  });

  it('throws an error if the class is called as a normal function', function () {
    expect(function() {
      NewClass();
    }).toThrow();
  });
});
