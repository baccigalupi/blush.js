Blush.polyfills.objectAssign = function() {
  var target = arguments[0];
  var current, key, argumentIndex;

  for (argumentIndex = 1; argumentIndex < arguments.length; argumentIndex++) {
		current = arguments[argumentIndex];
    for (key in current) {
      if (current.hasOwnProperty(key)) {
        target[key] = current[key];
      }
    }
	}

	return target;
};

Object.assign = Object.assign || Blush.polyfills.objectAssign;
