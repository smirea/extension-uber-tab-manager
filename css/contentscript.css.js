absurd.addStyle(function (api) {
  var css = {};

  css['#uberTabManager *'] = {
    xBoxSizing: 'border-box',
  };

  css['#uberTabManager'] = {
    dispaly: 'none',
    position: 'fixed',
    zIndex: 10000000,
    top: '10px',
    left: '10px',
    border: api.theme.borderStyle,
    backgroundColor: '#fff',
    width: '600px',
    fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
    fontSize: '13pt',
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
    fontSize: '14pt',

    ':focus': {
      outline: 'none',
      backgroundColor: '#e3f7ff',
    },
  };

  css['#utm-tabs'] = {
    listStyleType: 'none',
    maxHeight: '435px',
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

      '.utm-modifier': {
        fontSize: '0.7em',
        float: 'right',

        'b': {
          color: 'red',
        }
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
