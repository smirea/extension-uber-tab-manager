
var windows;

var layout = {
  container: null,
  search: null,
  tabs: null,
};


/**
 * Magic starts here.
 */
function init () {
  refresh(function () {
    init_layout();
    set_result(windows);
  });

  // attach_event('show', document, 'keydown', function (event) {
  //   if (!check_hotkey('ctrl+U', event)) return;

  // });
}

/**
 * Creates the DOM Structure, appends it to the DOM and then attaches the search events.
 */
function init_layout () {
  if (layout.container) {
    layout.container.parentNode.removeChild(layout.container);
  }

  layout.container = document.createElement('div');
  layout.container.setAttribute('id', 'uberTabManager');
  layout.container.innerHTML = '' +
    '<div id="utm-searchContainer">' +
      '<input type="text" id="utm-search" autofocus />' +
    '</div>' +
    '<ul id="utm-tabs"></ul>';
  layout.search = layout.container.querySelector('#utm-search');
  layout.tabs =  layout.container.querySelector('#utm-tabs');

  document.documentElement.appendChild(layout.container);
  init_search();
}

/**
 * Adds the events for searching.
 */
function init_search () {
  attach_event('search', layout.search, 'keyup', function (event) {
    var preventEvent = true;

    switch (event.keyCode) {
      case KEYS.ENTER:
        update_windows(eval_query(this.value));
        break;
      default:
        preventEvent = false;
    }

    if (preventEvent) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

/**
 * Sends the tab list to the background page to be executed.
 * @param  {TabList} tabList [description]
 */
function update_windows (tabList) {
  sendMessage('updateWindows', tabList, function (tabList) {
    console.log(tabList);
  });
}

/**
 * Evaluates the query and calls each script, passing its result onto the next.
 * @param  {String} string
 */
function eval_query (string) {
  var arr = string.split('|').map(function (s) { return s.trim().replace(/\s\s+/g, ' '); });
  var result = clone_windows(windows);

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
  return result;
}

/**
 * Check if a keyboard event matches the given hotkey.
 * IMPORTANT: You must use the NON-SHIFT value of a key (uppercase is ok, @ instead of 2 is not)
 *
 * Example: check_hotkey('ctrl+a', {ctrlKey:true, keyCode:97}) -> true;
 *
 * @param  {String} str
 * @param  {KeyboardEvent} event
 * @return {Boolean}
 */
function check_hotkey (str, event) {
  var arr = str.split('+');

  for (var i=0; i<arr.length - 1; ++i) {
    if (!event[arr[i].toLowerCase() + 'Key']) return false;
  }

  var code = arr[arr.length - 1].toUpperCase();
  code = /^[0-9]+$/.test(code) ? parseInt(code) : code.charCodeAt(0);

  return event.keyCode == code;
}

/**
 * Updates the DOM with the given tab list.
 * @param {WindowList} windowList
 */
function set_result (windowList) {
  console.log(windowList.map(function (w) { return w.tabs; }));
  layout.tabs.innerHTML = windowList.map(function (win) {
    return win.tabs.map(function (tab) {
      return tab.render();
    }).join('');
  }).join('');

  layout.container.style.display = 'block';
}

/**
 * Clones a list of windows
 * @param  {WindowList} windowList
 * @return {WindowList}
 */
function clone_windows (windowList) {
  return windowList.map(function (win) {
    var result = {};
    for (var key in win) {
      if (key == 'tabs') {
        result[key] = clone_tabs(win[key]);
        continue;
      }
      result[key] = win[key];
    }
    return result;
  });
}

/**
 * Returns a copy of the Tab array.
 * @param  {Array} TabList
 * @return {Array}
 */
function clone_tabs (tabList) {
  return tabList.map(function (tab) { return tab.clone(); });
}

/**
 * Re-fetches all data from the background page.
 * @param  {Function} callback
 */
function refresh (callback) {
  sendMessage('getWindows', null, function (result) {
    windows = result;

    //TODO: handle non-normal windows
    windows = windows.filter(function (win) { return win.type === 'normal'; });

    windows.forEach(function (win) {
      win.tabs = win.tabs.map(function (tab) { return new Tab(tab); });
      modifiers.position(win.tabs);
    });

    (callback || function () {})();
  });
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
 * Send a message to the background page.
 * @param  {String}   action
 * @param  {Object}   data
 * @param  {Function} callback
 */
function sendMessage (action, data, callback) {
  return chrome.runtime.sendMessage({action:action, data:data}, callback || function () {});
}


/**
 * init()
 */
init();
