
// Directory structure.
var dirs = {
  js: 'js/',
  css: 'css/',
  images: 'images/',
};

// Content script dependencies.
var dependencies = [
  dirs.js + 'utils.js',
];

var options = {
  disableGlobalHotkeys: false,
};

function init () {
  !options.disableGlobalHotkeys && init_global_hotkeys();
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

  // Message passing for requests.
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse();
    if (!sender.tab) { return; }
    switch (request) {
      case 'inti':
        initTab(sender.tab.id);
        break;
      default:
        console.warn('Unknown request type:', request, sender);
    }
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
