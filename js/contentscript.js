
var model = {
  tabs: null,
};

sendMessage('getTabs', {}, function (tabs) {
  model.tabs = tabs;
});

/**
 * Send a message to the background page.
 * @param  {String}   action
 * @param  {Object}   data
 * @param  {Function} callback
 */
function sendMessage (action, data, callback) {
  return chrome.runtime.sendMessage({action:action, data:data}, callback || function () {});
}
