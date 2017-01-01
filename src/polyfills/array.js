Blush.polyfills.arrayForEach = function arrayForEach(iterator) {
  var length = this.length;
  var i, element;
  for (i = 0; i < length; i++) {
    element = this[i];
    iterator(element, i, this);
  }
};

Array.prototype.forEach = Array.prototype.forEach || Blush.polyfills.arrayForEach;

Blush.polyfills.arrayFind = function arrayFind (iterator) {
  var length = this.length;
  var i, element, value;

  for (i = 0; i < length; i++) {
    element = this[i];
    value = iterator(element, i, this);
    if (value) { return element; }
  }
};

Array.prototype.find = Array.prototype.find || Blush.polyfills.arrayFind;
