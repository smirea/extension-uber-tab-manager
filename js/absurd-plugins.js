
var absurd = Absurd();

/**
 * Will create AbsurdJS plugins that add vendor prefix.
 * E.g. for box-shadow, the plugin will be xBoxShadow
 *
 * As well as other useful api extensions
 */
(function add_absurd_plugins (absurd) {

  var compileOptions = {
    combineSelectors: false,
    minify: false,
    keepCamelCase: false,
  };

  // scraped from http://peter.sh/experiments/vendor-prefixed-css-property-overview/
  var plugins = [
    'align-items', 'align-self', 'animation', 'animation-delay', 'animation-direction',
    'animation-duration', 'animation-fill-mode', 'animation-iteration-count',
    'animation-name', 'animation-play-state', 'animation-timing-function',
    'appearance', 'backface-visibility', 'background-blend-mode', 'background-clip',
    'background-origin', 'background-size', 'border-bottom-left-radius',
    'border-bottom-right-radius', 'border-end', 'border-end-color', 'border-end-style',
    'border-end-width', 'border-image', 'border-radius', 'border-start',
    'border-start-color', 'border-start-style', 'border-start-width',
    'border-top-left-radius', 'border-top-right-radius', 'box-align', 'box-flex',
    'box-ordinal-group', 'box-orient', 'box-pack', 'box-shadow', 'box-sizing',
    'caption-side', 'clip-path', 'column-count', 'column-fill', 'column-gap',
    'column-rule', 'column-rule-color', 'column-rule-style', 'column-rule-width',
    'column-width', 'columns', 'filter', 'flex', 'flex-basis', 'flex-direction',
    'flex-grow', 'flex-shrink', 'hyphens', 'justify-content', 'margin-end',
    'margin-start', 'mask', 'opacity', 'order', 'overflow-x', 'overflow-y',
    'padding-end', 'padding-start', 'perspective', 'perspective-origin',
    'text-decoration', 'text-decoration-color', 'text-decoration-line',
    'text-decoration-style', 'text-orientation', 'text-overflow', 'text-transform',
    'transform', 'transform-origin', 'transform-style', 'transition', 'transition-delay',
    'transition-duration', 'transition-property', 'transition-timing-function',
    'word-break', 'writing-mode',
  ];

  plugins.forEach(function create_absurd_vendor_plugin (property) {
    var name = toCamelCase(property);
    var camelName = name.slice(0, 1).toUpperCase() + name.slice(1);
    name = 'x' + camelName;
    absurd.plugin(name, function add_vendor_prefix (api, str) {
      var css = {};
      css['Webkit' + camelName] = str;
      css['Moz' + camelName] = str;
      css['O' + camelName] = str;
      css[property] = str;
      return css;
    });
  });

  /**
   * Converts HEX to RGBA. Default opacity is 1.
   * @param  {String} hex
   * @param  {String} opacity=1 Optional.
   * @return {String}
   */
  absurd.register('hexToRGBA', function hexToRGBA (hex, opacity) {
    opacity = opacity === undefined ? 1 : opacity;
    hex = hex.replace(/^#/, '');
    if (hex.length == 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return 'rgba(' +
      parseInt(hex.slice(0, 2), 16) + ', ' +
      parseInt(hex.slice(2, 4), 16) + ', ' +
      parseInt(hex.slice(4, 6), 16) + ', ' +
      opacity +
    ')';
  });

  /**
   * Compile an Absurd CSS style and append it to the DOM
   * @param  {Object|Function} css Either an Absurd CSS Object or a function that
   *                                  gets the absurd object as its first argument
   *                                  and returns a CSS Object.
   */
  absurd.register('addStyle', function absurd_addStyle (css) {
    if (typeof css == 'function') {
      css = css(absurd);
    }
    absurd.add(css).compile(function absurd_addStyle_compile (error, css) {
      if (error) {
        throw error;
      }
      var style = document.createElement('style');
      style.innerHTML = css;
      style.classList.add('absurd-style');
      document.head.appendChild(style);
      console.info(css);
    }, compileOptions);
  });

  /**
   * Converts a CSS property name from the standard dash notation to camel case.
   * E.g. border-top-color -> borderTopColor
   * @param  {String} str
   * @return {String}
   */
  function toCamelCase (str) {
    return str.replace(/-[a-z]/g, function hyphenToUpper (match) {
      return match[1].toUpperCase();
    });
  }
})(absurd);
