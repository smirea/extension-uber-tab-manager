absurd.addStyle(function (api) {
  var css = {};

  css['#uberTabManager *'] = {
    xBoxSizing: 'border-box',
    fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
    fontSize: '13pt',
  };

  css['#uberTabManager'] = {
    width: '600px',
    border: api.theme.borderStyle,
    fontSize: '14px',
  };

  css['#utm-searchContainer'] = {
    position: 'relative',
    margin: 0,
    padding: 0,
  };

  css['#utm-search'] = {
    width: '100%',
    border: 0,
    borderBottom: api.theme.borderStyle,
    margin: 0,
    padding: '10px 15px',

    ':focus': {
      outline: 'none',
      backgroundColor: '#e3f7ff',
    },
  };

  css['#utm-tabs'] = {
    listStyleType: 'none',
    maxHeight: '690px',
    overflow: 'auto',
    margin: 0,
    padding: 0,

    '.utm-tab': {
      position: 'relative',
      padding: '5px 5px 5px 10px',
      whiteSpace: 'pre',
      overflow: 'hidden',

      '.utm-favicon': {
        float: 'left',
        display: 'inline-block',
        minWidth: '16px',
        maxHeight: '16px',
        margin: '1px 5px 1px 1px',
      },

      '.utm-window-marker': {
        display: 'inline-block',
        position: 'absolute',
        left: '2px',
        top: '1px',
        bottom: '1px',
        backgroundColor: '#ccc',
        width: '5px',
      },

      '.utm-url': {
        fontSize: '0.8em',
        color: '#828696',
      },
    },

    '.utm-tab + .utm-tab': {
      borderTop: api.theme.borderStyle,
    },
  };

  '#00b3ff #ff7b13 #4bcd79 purple crimson'.split(' ').forEach(function (color, index) {
    css['#utm-tabs .utm-window-marker.utm-window-' + index] = {
      backgroundColor: color,
    };
  });

  return css;
});
