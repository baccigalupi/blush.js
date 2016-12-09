describe('Blush.polyfills.objectAssign', function () {
  var objectAssign = Blush.polyfills.objectAssign;

  it('combines two objects', function () {
    var result = objectAssign({foo: 0}, {bar: 1});
    expect(result).toEqual({foo: 0, bar: 1});
  });

  it('combines more than that', function () {
    var result = objectAssign({foo: 0}, {bar: 1}, {baz: 2});
    expect(result).toEqual({foo: 0, bar: 1, baz: 2});
  });

  it('overwrites earlier values with later values', function () {
    var result = objectAssign({foo: 0}, {foo: 1}, {foo: 2});
    expect(result).toEqual({foo: 2});
  });

  it('ignores null values', function () {
    var result = objectAssign({foo: 0}, null, {bar: 1}, undefined);
    expect(result).toEqual({foo: 0, bar: 1});
  });
});
