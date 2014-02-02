

var options = {
  disableGlobalHotkeys: true,
};

// Directory structure.
var dirs = {
  js: 'js/',
  css: 'css/',
  images: 'images/',
};

// Content script dependencies.
var dependencies = [
  'bower/absurd/index.js',
  'js/absurd-plugins.js',
  'css/theme.css.js',
  'css/contentscript.css.js',
  'js/utils.js',
  'js/Tab.js',
  'js/scripts.js',
  'js/contentscript.js',
];

/**
 * These are all the actions that can be used in the protocol.
 *
 * NOTE: Handlers that use sendResponse async should return true;
 *
 * Most handlers will have the following structure:
 * @param  {Mixed} data
 * @param  {Object} sender
 * @param  {Object} sendResponse
 * @return {Boolean}
 */
var handlers = {
  /**
   * Performs modifications on the tabs.
   * @param  {windowList} data
   */
  updateWindows: function (data, sender, sendResponse) {
    var callbacks = [];

    data.forEach(function (win) {
      callbacks = callbacks.concat(win.tabs.map(function (tab) {
        return function (callback) {
          chrome.tabs.move(
            tab.id,
            {windowId:tab.windowId, index:tab.modifiers.position},
            callback.bind(null, null)
          );
        };
      }));
    });

    async.series(callbacks, function (err, result) {
      if (err) { console.warn(err); }
      getWindows(data, sendResponse);
    });

    return true;
  },

  getWindows: function (data, sender, sendResponse) {
    getWindows(data, sendResponse);
    return true;
  },

  /**
   * Performs a chrome.tabs.query() and returns the enhanced result of tabs.
   */
  query: function (data, sender, sendResponse) {
    getWindows(data, sendResponse);
    return true;
  },

  /**
   * Loads all the dependencies in the tab.
   */
  initTab: function (data, sender, sendResponse) {
    initTab(sender.tab.id, sendResponse);
    return true;
  },

  /**
   * Basic echo for testing
   */
  echo: function (data, sender, sendResponse) {
    console.log('ECHO: ', data);
    sendResponse(data);
  },
};

/**
 * Adds extra data to the Tab objects.
 * Side-effect: it also changes the objects, it does not return a copy.
 *
 * @param  {Array} tabs
 * @return {Array}
 */
function enhanceWindows (windows) {
  windows.forEach(function (win, winIndex) {
    win.tabs.forEach(function (tab) {
      tab.windowNumber = winIndex;
      tab.url = '{hostname}{pathname}'.format(parseURI(tab.url));
    });
  });

  return windows;
}

/**
 * Gets all the windows async, enhances their them, and passes them to the callback.
 * @param  {Object} data Used for filtering in chrome.windows.getAll().
 * @param  {Function} callback
 */
function getWindows (data, callback) {
  chrome.windows.getAll(data || {populate:true}, function (windows) {
    enhanceWindows(windows);
    callback(windows);
  });
}

/**
 * Where all the magic happens.
 */
function init () {
  init_protocol();

  just_for_testing();

  !options.disableGlobalHotkeys && init_global_hotkeys();
  console.info('[INIT] done');
}

function just_for_testing () {
  // chrome.tabs.query({}, function (tabs) {
  //   for (var i=0; i<tabs.length; ++i) {
  //     initTab(tabs[i].id);
  //   }
  // });

  chrome.tabs.onUpdated.addListener(function (tabId, info) {
    if (info.status != "complete") { return; }
    initTab(tabId);
  });
}

/**
 * All pages will be injected with a very small content script which adds key bindings that
 * can be used to request the pre-load of the big cheese.
 */
function init_global_hotkeys () {
  var deps = ['js/contentscript-hotkeys.js'];

  // Add hotkeys to all tabs.
  chrome.tabs.query({}, function (tabs) {
    for (var i=0; i<tabs.length; ++i) {
      syncLoading(deps, tabs[i].id);
    }
  });

  // Always add hotkey script to new tabs.
  chrome.tabs.onUpdated.addListener(function (tabId, info) {
    if (info.status != "complete") { return; }
    syncLoading(deps, tabId);
  });
}

/**
 * What protocol is supported. Define protocol actions in the handlers global object.
 */
function init_protocol () {
  // Message passing for requests.
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (!sender.tab) {
      console.warn('No sender.tab', sender);
      return; sendResponse(null);
    }

    if (!(request.action in handlers)) {
      console.warn('Unknown request type:', request, sender);
      sendResponse(null);
    }

    return handlers[request.action](request.data, sender, sendResponse);
  });
}

/**
 * Initializes a tab by adding all the file dependencies for the content-script to it.
 * @param  {Number}   tabId
 * @param  {Function} callback
 */
function initTab (tabId, callback) {
  return syncLoading(dependencies, tabId, null, callback);
}

/**
 * Sequencially load the files into a tab.
 * @param  {Object}   files
 * @param  {Number}   tab
 * @param  {Number}   index = 0
 * @param  {Function} callback
 */
function syncLoading (files, tab, index, callback) {
  tab = tab || null;
  index = index || 0;
  callback = callback || function _emptyCallback () {};

  var fileObject = typeof files[index] === 'object' ? files[index]
                                                      : { file: files[index] };
  var extension = fileObject.file.slice(fileObject.file.lastIndexOf('.')+1);
  var loadFunction = extension === 'js' ? 'executeScript' : 'insertCSS';

  chrome.tabs[loadFunction](
    tab,
    fileObject,
    (function _setupNextCallback (newFile, newIndex) {
      return function _callNextSyncLoading () {
        if (index + 1 < files.length) {
          syncLoading(files, tab, newIndex, callback);
        } else {
          callback(files);
        }
      };
    }(fileObject, index+1))
  );
}

/**
 * INIT
 */
init();
