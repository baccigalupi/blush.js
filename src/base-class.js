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

Blush.BaseClass.extend = function extend(attrs) {
  var ParentClass = this;
  var ChildClass  = Blush.createConstructor();

  var proto = {};
  proto = Blush.BaseClass.mixProto(proto, ParentClass.prototype);
  proto = Blush.BaseClass.mixProto(proto, attrs);

  ChildClass.prototype = proto;
  ChildClass.prototype.contstructor = ChildClass;
  ChildClass.prototype.klass        = ChildClass;
  ChildClass.extend = extend;

  return ChildClass;
};

Blush.BaseClass.mixProto = function mixProto(origProto, attrs) {
  var proto = Object.assign({}, origProto);
  var attr;

  for (var attr in attrs) {
    if ( attr.match(/prototype|__proto__|superclass|constructor/) ) { continue; }
    proto[attr] = attrs[attr];
  }

  return proto;
};
