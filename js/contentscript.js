
var windows = null;
var tabs = null;

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

/**
 * Evaluates the query and calls each script, passing its result onto the next.
 * @param  {String} string
 */
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
 $(init);
