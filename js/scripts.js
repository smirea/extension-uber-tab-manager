/**
 * These are all the functions that can be used in the "terminal".
 * Each script name corresponds to a function.
 */
var scripts = (function () {
  var result = {
    /**
     * Performs fuzzy searching on the tabs and returns
     * @param  {tabList} tabs
     * @param  {String} str
     * @return {tabList}
     */
    find: function (windows, str) {
      str = str || '';
      return windows.forEach(function (win) {
        win.tabs = win.tabs.map(function (tab) {
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
      });
    },

    /**
     * Sorts the given tabs
     *
     * Modifiers: position
     *
     * @param  {tabList} tabs
     * @return {tabList}
     */
    sort: function (windows) {
      var opt = get_options(cloneArray(arguments).slice(1), {
        sortKey: ['url', 'title'],
        order: ['asc', 'desc'],
      });

      return windows.forEach(function (win) {
        win.tabs.sort(function (a, b) {
          return  (a[opt.sortKey] < b[opt.sortKey] && -1) ||
                  (a[opt.sortKey] > b[opt.sortKey] && 1) ||
                  0;
        });
        opt.order == 'desc' && win.tabs.reverse();
        modifiers.position(win.tabs);
      });
    },

    /**
     * Randomizes the order of the tabs.
     *
     * Modifiers: position
     *
     * @param  {tabList} tabs
     * @return {tabList}
     */
    shuffle: function (windows) {
      return windows.forEach(function (win) {
        modifiers.position(win.tabs.shuffle());
      });
    },

    /**
     * Reverses the order of the tabs.
     *
     * Modifiers: position
     *
     * @param  {tabList} tabs
     * @return {tabList}
     */
    reverse: function (windows) {
      return windows.forEach(function (win) {
        modifiers.position(win.tabs.reverse());
      });
    },

    /**
     * META: This function does not alter the tabs
     * @param {tabList} tabs
     */
    set: function (windows) {
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

  /**
   * Return
   */
  return result;
})();

/**
 * Extracts all tabs from a windowList
 * @param  {windowList} window
 * @return {tabList}
 */
function getTabsFromWindows (window) {
  var result = [];
  windows.forEach(function (win) { result = result.concat(win.tabs); });
  return result;
}

/**
 * Methods that help with updating tabLists' modifiers.
 *
 * All these methods will have as side-effects the alterations of the tab.modifiers property.
 */
var modifiers = {
  position: function (tabList) {
    return tabList.map(function (tab, index) {
      tab.modifiers.position = index;
      return tab;
    });
  }
};
