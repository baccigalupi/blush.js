Blush.utils.functionBind = function functionBind(context) {
  var func = this;
  return function() {
    return func.apply(context, arguments);
  };
};

Function.prototype.bind = Function.prototype.bind || Blush.utils.functionBind;
