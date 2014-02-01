
(function () {
  if (window.hotkeys_bind) { return; }

  var hotkey = 13; // ENTER
  var excludeTags = 'select input textarea'.split(' ');

  document.addEventListener('keydown', oneShotHotkeys);

  window.hotkeys_bind = true;
  window.hotkeys_unbind = function () {
    document.removeEventListener('keydown', oneShotHotkeys);
    delete window.hotkeys_bind;
    delete window.hotkeys_unbind;
  };

  function oneShotHotkeys (event) {
    if (event.keyCode != hotkey) { return; }

    // Check if the element is not an text input.
    if (excludeTags.indexOf(event.target.nodeName.toLowerCase()) > -1) { return; }

    // Check to see if the element or any of its parents is not a rich text field.
    var p = event.target;
    while (p && p != document) {
      if (p.getAttribute('contenteditable')) { return; }
      p = p.parentNode;
    }

    window.hotkeys_unbind();
    sendMessage('init');
  }

  function sendMessage (data, callback) {
    return chrome.runtime.sendMessage(data, callback || function () {});
  }
})();
