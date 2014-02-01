/**
 * These are all the functions that can be used in the "terminal".
 * Each script name corresponds to a function.
 * @type {Object}
 */
var scripts = {
  /**
   * Performs fuzzy searching on the tabs and returns
   * @param  {Array} tabs
   * @param  {String} str
   * @return {Array}
   */
  find: function (tabs, str) {
    str = str || '';
    return tabs.map(function (tab) {
      var res = {
        title: tab.title.fuzzySearch(str, true),
        url: tab.url.fuzzySearch(str, true),
      };
      for (var key in res) { res[key + 'Score'] = fuzzyScore(res[key]); }
      res.tab = tab;
      return res;
    }).filter(function (match) {
      return match.title !== null || match.url !== null;
    }).map(function (match) {
      match.score = Math.min(match.titleScore, match.urlScore * 0.5);
      return match;
    }).sort(function (a, b) {
      return a.score - b.score;
    }).map(function (match) {
      return match.tab;
    });
  },

  /**
   * Sorts the given tabs
   * @param  {Array} tabs
   * @return {Array}
   */
  sort: function (tabs) {
    var opt = get_options(cloneArray(arguments).slice(1), {
      sortKey: ['url', 'title'],
      order: ['asc', 'desc'],
    });

    tabs.sort(function (a, b) {
      return  (a[opt.sortKey] < b[opt.sortKey] && -1) ||
              (a[opt.sortKey] > b[opt.sortKey] && 1) ||
              0;
    });

    opt.order == 'desc' && tabs.reverse();

    return tabs;
  },

  /**
   * Randomizes the order of the tabs.
   * @param  {Array} tabs
   * @return {Array}
   */
  shuffle: function (tabs) {
    return tabs.shuffle();
  },

  /**
   * META: This function does not alter the tabs
   * @param {Array} tabs
   */
  set: function (tabs) {
    // TODO:
  },
};


/**
 * Gets the computed options form the set of arguments.
 *
 * Example: get_options(['yolo', '-a', '-x'], {vowel:['i', 'a'], consonants:['t', 'z', 'x']})
 *   -> {vowel: 'a', consonant: 'x'}
 *
 * @param  {Array} args
 * @param  {Object} options See example.
 * @return {Object}
 */
function get_options (args, options) {
  var result = {};
  for (var key in options) { result[key] = options[key][0]; }

  args.forEach(function (arg) {
    if (arg[0] != '-') { return; }
    arg = arg.slice(1);
    for (var key in options) {
      if (options[key].indexOf(arg) == -1) { continue; }
      result[key] = arg;
    }
  });

  return result;
}
