
/**
 * Shuffle an array. Does a much better distribution than using the .sort() method.
 * @return {Array}
 */
Object.defineProperty(Array.prototype, "shuffle", {
  enumerable: false,
  configurable: true,
  writable: true,
  value: function () {
    for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    return this;
  }
});

/**
 * Perform fuzzy searching on the string.
 *
 * @param  {String} str The string to match against.
 * @param {Boolean} case_insensitive=false
 *
 * @return {Object|null} If a full match is not found, null is returned.
 * If a match is found, the resulting object will have as keyx the index in the
 * original string where the the substring is found.
 *
 * @example
 * 'I am a little string'.fuzzySearch('yolo'); // null
 * 'I am a little string'.fuzzySearch('ials'); // {8: "it", 11: "le", 15: "tring"}
 * 'I am a little string'.fuzzySearch('ials'); // {0: "I", 9: "t", 11: "le", 15: "tring"}
 */
String.prototype.fuzzySearch = function (str, case_insensitive) {
  var origin = this;
  if (case_insensitive) {
    origin = this.toLowerCase();
    str = str.toLowerCase();
  }
  var result = {};
  var j = 0;
  for (var i = 0; i < origin.length && j < str.length; ++i) {
    var start = null;
    while (str[j] == origin[i] && i < origin.length && j < str.length) {
      start = start !== null ? start : i;
      ++i;
      ++j;
    }
    if (start !== null) {
      result[start] = this.slice(start, i);
    }
  }
  return j == str.length ? result : null;
};

/**
 * Object string formatting.
 * Example: "I {verb} yolo {adjective}".format({verb:'love', adjective:'mofo'})
 *    -> "I love yolo mofo";
 * @param  {Object} obj
 * @return {String}
 */
String.prototype.format = function (obj) {
  var result = this;
  for (var key in obj) {
    result = result.replace(new RegExp('\\{' + key + '\\}', 'g'), obj[key]);
  }
  return result;
}

/**
 * Returns the score of a fuzzy search using String.prototype.fuzzySearch();
 * A smaller score means a better match.
 * Returns Infinity if no match was found (aka if object is null)
 *
 * @param  {Object} obj
 * @return {Number}
 */
function fuzzyScore (obj) {
  if (obj === null) { return Infinity; }
  var score = 0;
  for (var pos in obj) {
    var len = obj[pos].length;
    score += (pos * len + ((len - 1) * len / 2));
  }
  return score;
}

/**
 * Returns all the components of an URI.
 *
 * Example: parseURI("http://example.com:3000/pathname/?search=test#hash")
 * will return:
 *
 * {  protocol: "http:",
 *    hostname: "example.com",
 *    port: "3000",
 *    pathname: "/pathname/",
 *    search: "?search=test",
 *    hash: "#hash",
 *    host: "example.com:3000",
 * }
 *
 * @param  {String} str
 * @return {Object}
 */
function parseURI (str) {

  var parser = document.createElement('a');
  parser.href = str;

  var result = {};
  var keys = ['protocol', 'hostname', 'port', 'pathname', 'search', 'hash', 'host'];
  keys.forEach(function (key) { result[key] = parser[key]; });

  ['host', 'hostname'].forEach(function (key) {
    result[key] = result[key].replace(/^www\./, '');
  });

  return result;
}

/**
 * localStorage enhancer. Auto JSON.stringify and JSON.encodes all the elements.
 * @type {Object}
 */
var ls = {
  /**
   * Set a key. Auto JSON.stringify
   * @param {String|Object} key  Set multiple keys at once by passing an object as a key and no value.
   * @param {Mixed} value Optional if the first argument is an Object.
   * @return {Object} chainable
   */
  set: function (key, value) {
    if (arguments.length === 1 && typeof key == 'object' && key !== null) {
      for (var name in key) { ls.set(name, key[name]); }
    } else {
      localStorage[key] = JSON.stringify(value);
    }
    return this;
  },

  /**
   * Get a key from localStorage. Auto JSON.parse
   * @param  {String} key
   * @param  {Mixed} defaultValue Optional. A default value to return if the key does not exist.
   * @return {Mixed}
   */
  get: function (key, defaultValue) {
    if (!(key in localStorage)) {
      return defaultValue;
    }
    try {
      return JSON.parse(localStorage[key]);
    } catch (ex) {
      console.warn('Never use plain localStorage to set shit!\nOtherwise this happens: ' + ex, ex.stack);
      return defaultValue;
    }
  },

  /**
   * Deletes a key from localStorage
   * @param  {String} key
   * @return {Boolean}
   */
  remove: function (key) {
    return (delete localStorage[key]);
  },

  /**
   * Prints out an indented stringified JSON of the value.
   * Takes the same arguments as ls.get();
   * @see get
   * @return {Object} chainable
   */
  debug: function () {
    console.log(JSON.stringify(ls.get.apply(ls, arguments), null, 2));
    return this;
  },
};

/**
 * Converts an array-like object to an array.
 * Mainly used for converting arguments to actual arrays.
 * @param  {Object|Array} arr
 * @return {Array}
 */
function cloneArray (arr) {
  return Array.prototype.slice.call(arr);
}

/**
 * Does a deep copy of the object.
 * @param  {Object} obj
 * @return {Object}
 */
function cloneObject (obj) {
  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    var copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    var copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = cloneObject(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    var copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = cloneObject(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

var KEYS = {
  CANCEL: 3,
  HELP: 6,
  BACK_SPACE: 8,
  TAB: 9,
  CLEAR: 12,
  RETURN: 13,
  ENTER: 13,
  SHIFT: 16,
  CONTROL: 17,
  ALT: 18,
  PAUSE: 19,
  CAPS_LOCK: 20,
  ESCAPE: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  PRINTSCREEN: 44,
  INSERT: 45,
  DELETE: 46,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  SEMICOLON: 59,
  EQUALS: 61,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  COMMAND: 91,
  CONTEXT_MENU: 93,
  NUMPAD0: 96,
  NUMPAD1: 97,
  NUMPAD2: 98,
  NUMPAD3: 99,
  NUMPAD4: 100,
  NUMPAD5: 101,
  NUMPAD6: 102,
  NUMPAD7: 103,
  NUMPAD8: 104,
  NUMPAD9: 105,
  MULTIPLY: 106,
  ADD: 107,
  SEPARATOR: 108,
  SUBTRACT: 109,
  DECIMAL: 110,
  DIVIDE: 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  F13: 124,
  F14: 125,
  F15: 126,
  F16: 127,
  F17: 128,
  F18: 129,
  F19: 130,
  F20: 131,
  F21: 132,
  F22: 133,
  F23: 134,
  F24: 135,
  NUM_LOCK: 144,
  SCROLL_LOCK: 145,
  COMMA: 188,
  PERIOD: 190,
  SLASH: 191,
  BACK_QUOTE: 192,
  OPEN_BRACKET: 219,
  BACK_SLASH: 220,
  CLOSE_BRACKET: 221,
  QUOTE: 222,
  META: 224
};
