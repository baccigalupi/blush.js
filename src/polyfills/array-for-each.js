Blush.polyfills.arrayForEach = function arrayForEach(iterator) {
  var length = this.length;
  var i, element;
  for (i = 0; i < length; i++) {
    element = this[i];
    iterator(element, i, this);
  }
};

Array.prototype.forEach = Array.prototype.forEach || Blush.polyfills.arrayForEach;
