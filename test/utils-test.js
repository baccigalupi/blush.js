describe('Blush.utils.camelize', function () {
  it('converts a single word to title cased', function () {
    expect(Blush.utils.camelize('foo')).toBe('foo');
  });

  it('translates an underscore before a letter to a capitalized letter', function () {
    expect(Blush.utils.camelize('foo_bar')).toBe('fooBar');
  });
});
