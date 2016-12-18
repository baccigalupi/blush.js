describe('Blush.utils.camelize', function () {
  it('converts a single word to title cased', function () {
    expect(Blush.utils.camelize('foo')).toBe('foo');
  });

  it('translates an underscore before a letter to a capitalized letter', function () {
    expect(Blush.utils.camelize('foo_bar')).toBe('fooBar');
  });
});

describe('is type functions', function() {
  it('isFunction works', function() {
    expect(Blush.utils.isFunction(function() {})).toBe(true);
    expect(Blush.utils.isFunction(false)).toBe(false);
    expect(Blush.utils.isFunction(undefined)).toBe(false);
    expect(Blush.utils.isFunction(null)).toBe(false);
    expect(Blush.utils.isFunction(3.24)).toBe(false);
    expect(Blush.utils.isFunction('strung')).toBe(false);
    expect(Blush.utils.isFunction(/rex/i)).toBe(false);
    expect(Blush.utils.isFunction(new Date())).toBe(false);
    expect(Blush.utils.isFunction({})).toBe(false);
    expect(Blush.utils.isFunction([])).toBe(false);
  });

  it('isNil works', function() {
    expect(Blush.utils.isNil(function() {})).toBe(false);
    expect(Blush.utils.isNil(false)).toBe(false);
    expect(Blush.utils.isNil(undefined)).toBe(true);
    expect(Blush.utils.isNil(null)).toBe(true);
    expect(Blush.utils.isNil(0)).toBe(false);
    expect(Blush.utils.isNil(3.24)).toBe(false);
    expect(Blush.utils.isNil('strung')).toBe(false);
    expect(Blush.utils.isNil(/rex/i)).toBe(false);
    expect(Blush.utils.isNil(new Date())).toBe(false);
    expect(Blush.utils.isNil({})).toBe(false);
    expect(Blush.utils.isNil([])).toBe(false);
  });

  it('isNumber works', function() {
    expect(Blush.utils.isNumber(function() {})).toBe(false);
    expect(Blush.utils.isNumber(false)).toBe(false);
    expect(Blush.utils.isNumber(undefined)).toBe(false);
    expect(Blush.utils.isNumber(null)).toBe(false);
    expect(Blush.utils.isNumber(0)).toBe(true);
    expect(Blush.utils.isNumber(3.24)).toBe(true);
    expect(Blush.utils.isNumber('strung')).toBe(false);
    expect(Blush.utils.isNumber(/rex/i)).toBe(false);
    expect(Blush.utils.isNumber(new Date())).toBe(false);
    expect(Blush.utils.isNumber({})).toBe(false);
    expect(Blush.utils.isNumber([])).toBe(false);
  });

  it('isObject works', function() {
    expect(Blush.utils.isObject(function() {})).toBe(false);
    expect(Blush.utils.isObject(false)).toBe(false);
    expect(Blush.utils.isObject(undefined)).toBe(false);
    expect(Blush.utils.isObject(null)).toBe(false);
    expect(Blush.utils.isObject(0)).toBe(false);
    expect(Blush.utils.isObject(3.24)).toBe(false);
    expect(Blush.utils.isObject('strung')).toBe(false);
    expect(Blush.utils.isObject(/rex/i)).toBe(false);
    expect(Blush.utils.isObject(new Date())).toBe(false);
    expect(Blush.utils.isObject({})).toBe(true);
    expect(Blush.utils.isObject([])).toBe(false);
  });

  it('isArray works', function() {
    expect(Blush.utils.isArray(function() {})).toBe(false);
    expect(Blush.utils.isArray(false)).toBe(false);
    expect(Blush.utils.isArray(undefined)).toBe(false);
    expect(Blush.utils.isArray(null)).toBe(false);
    expect(Blush.utils.isArray(0)).toBe(false);
    expect(Blush.utils.isArray(3.24)).toBe(false);
    expect(Blush.utils.isArray('strung')).toBe(false);
    expect(Blush.utils.isArray(/rex/i)).toBe(false);
    expect(Blush.utils.isArray(new Date())).toBe(false);
    expect(Blush.utils.isArray({})).toBe(false);
    expect(Blush.utils.isArray([])).toBe(true);
  });

  it('isString works', function() {
    expect(Blush.utils.isString(function() {})).toBe(false);
    expect(Blush.utils.isString(false)).toBe(false);
    expect(Blush.utils.isString(undefined)).toBe(false);
    expect(Blush.utils.isString(null)).toBe(false);
    expect(Blush.utils.isString(0)).toBe(false);
    expect(Blush.utils.isString(3.24)).toBe(false);
    expect(Blush.utils.isString('strung')).toBe(true);
    expect(Blush.utils.isString(/rex/i)).toBe(false);
    expect(Blush.utils.isString(new Date())).toBe(false);
    expect(Blush.utils.isString({})).toBe(false);
    expect(Blush.utils.isString([])).toBe(false);
  });
});
