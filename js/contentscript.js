
var windows = null;
var tabs = null;

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

function init () {
  $.getJSON('dummy-tabs.json', function (result) {
    // Generate the windows and add the .window property to each tab.
    windows = {};
    var windowNumber = {};
    var counter = 0;
    result.forEach(function (tab) {
      if (!(tab.windowId in windows)) {
        windows[tab.windowId] = [];
        windowNumber[tab.windowId] = counter++;
      }
      tab.window = windowNumber[tab.windowId];
      tab.url = '{hostname}{pathname}'.format(parseURI(tab.url));
      windows[tab.windowId].push(tab);
    });

    tabs = result.map(function (t) { return new Tab(t); });

    set_result(tabs);
    init_search();

    // testing stuff
    $('pre').last().html(JSON.stringify(tabs, null, 2));
  });
}

function init_search () {
  attach_event('search', document.getElementById('utm-search'), 'keyup', function (event) {
    var preventEvent = true;

    switch (event.keyCode) {
      case KEYS.ENTER: eval_query(this.value); break;
      default:
        preventEvent = false;
    }

    if (preventEvent) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

function eval_query (string) {
  var arr = string.split('|').map(function (s) { return s.trim().replace(/\s\s+/g, ' '); });
  var result = cloneTabs(tabs);

  arr.forEach(function (str) {
    var args = str.split(' ');
    var name = args[0];

    if (!(name in scripts)) {
      console.warn('Unknown script: %s', name);
      return;
    }

    args[0] = result;
    // If a script does not return anything (e.g. undefined | null), it won't be considered
    result = scripts[name].apply(null, args) || result;
  });

  set_result(result);
}

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
 * Updates the DOM with the given tab list.
 * @param {Array} tabList
 */
function set_result (tabList) {
  document.getElementById('utm-tabs').innerHTML = tabList.map(function (tab) {
    return tab.render();
  }).join('');
}

/**
 * Returns a copy of the Tab array.
 * @param  {Array} tabList
 * @return {Array}
 */
function cloneTabs (tabList) {
  return tabList.map(function (tab) { return tab.clone(); });
}

// All events attached with attach_event() will be stored here fore cleanup purposes.
var events = {};

/**
 * Attach an event to an element.
 * This keeps track of all events for cleanup purposes.
 *
 * @param  {String}   name
 * @param  {Node}   elem
 * @param  {String}   eventType
 * @param  {Function} callback  [description]
 */
function attach_event (name, elem, eventType, callback) {
  if (name in events) { detach_event(name); }

  elem.addEventListener(eventType, callback, false);
  events[name] = [elem, eventType, callback];
}

/**
 * Remove an event attached with attach_event().
 * @param  {String} name
 */
function detach_event (name) {
  if (!events[name]) { return; }

  events[name][0].removeEventListener(events[name][1], events[name][2], false);
}

/**
 * init()
 */
 $(init);
