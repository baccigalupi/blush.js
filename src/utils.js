Blush.utils.isFunction = Mario.isFunction;
Blush.utils.camelize = function camelize(word) {
  return word.replace(/(_\w)/g, function (g) {
    return g[1].toUpperCase();
  });
};
