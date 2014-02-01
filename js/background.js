
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
 * INIT
 */
init();
