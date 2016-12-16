describe('Blush.polyfills.arrayForEach', function() {
  it('calls a function with each element', function() {
    let array = [1, 2, 3];
    let results = [];

    Blush.polyfills.arrayForEach.call(array, function(element, index, fullArray) {
      results.push({element: element, index: index, fullArray: fullArray});
    });

    expect(results[0]).toEqual({element: 1, index: 0, fullArray: [1,2,3]});
    expect(results[1]).toEqual({element: 2, index: 1, fullArray: [1,2,3]});
    expect(results[2]).toEqual({element: 3, index: 2, fullArray: [1,2,3]});
  });
});
