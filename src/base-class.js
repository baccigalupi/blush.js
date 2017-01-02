Blush.createConstructor = function() {
  var klass = function klass() {
    if (!(this instanceof klass)) {
      throw new Error('This is a class, and cannot be called without the new keyword.');
    }
    this.__initialize.apply(this, arguments);
  };
  return klass;
};

Blush.BaseClass = Blush.createConstructor();

Blush.BaseClass.prototype.__initialize = function () {
  this._initialize.apply(this, arguments);
  this.initialize.apply(this, arguments);
};

Blush.BaseClass.prototype._initialize = function () {};
Blush.BaseClass.prototype.initialize = function () {};

Blush.BaseClass.extend = function extend() {
  var parentClass = this;
  var childClass  = Blush.createConstructor();
  var prototypeExtensions = Array.prototype.slice.call(arguments);
  prototypeExtensions.unshift(parentClass.prototype);
  prototypeExtensions.unshift({ constructor: childClass });
  childClass.prototype = Object.assign.apply(null, prototypeExtensions);
  childClass.extend = extend;
  return childClass;
};
