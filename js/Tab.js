
var Tab = (function () {
  /**
   * Creates a wrapper for the chrome.Tab with some extra functionality.
   * @param {Object} data The data from chrome.query({})
   */
  function Tab (data) {
    for (var key in data) {
      this[key] = data[key];
    }

    this.modifiers = cloneObject(data.modifiers || Tab.MODIFIERS, true);
  }

  Tab.MODIFIERS = {
    position: null,
  };

  Tab.prototype = {

    modifiers: null,

    /**
     * Returns a new instance of the same tab.
     * Goes one level deep into cloning.
     * @return {Tab}
     */
    clone: function () {
      var data = {};
      for (var key in this) {
        if (typeof this[key] == 'function') { continue; }

        if (Array.isArray(this[key])) {
          data[key] = cloneArray(this[key]);
          continue;
        }

        if (typeof this[key] == 'object') {
          data[key] = cloneObject(this[key]);
          continue;
        }

        data[key] = this[key];
      }
      return new Tab(data);
    },

    /**
     * Returns a string representation of itself
     * @return {String}
     */
    render: function () {
      return ('' +
        '<li class="utm-tab" tabid="{id}">' +
          (Object.keys(this.modifiers).map(function (m) {
            return '<div class="utm-modifier"><b>{0}:</b> {1}</div>'.
                    format([m, this.modifiers[m]]);
          }.bind(this)).join('')) +
          '<span class="utm-window-marker utm-window-{windowNumber}">&nbsp;</span>' +
          '<img class="utm-favicon" alt="[!]" src="{favIconUrl}" />' +
          '<div class="utm-title">{title}</div>' +
          '<div class="utm-url">{url}</div>' +
        '</li>').
        format({
          id: this.id,
          windowNumber: this.windowNumber,
          favIconUrl: this.favIconUrl,
          title: maxLength(this.title, 50),
          url: this.url,
        });
    },

    toString: function () {
      return '[#id title]'.format({
        id: this.id,
        title: maxLength(this.title, 15),
      });
    },
  };

  /**
   * Trims a string after a certain length and adds '...'
   * @param  {String} str
   * @param  {Number} length
   * @param  {String} dotdotdot
   * @return {String}
   */
  function maxLength (str, length, dotdotdot) {
    dotdotdot = dotdotdot || '...';
    return str.length > length ? str.slice(0, length) + dotdotdot : str;
  }

  return Tab;

})();
