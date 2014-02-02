
(function add_theme_styles () {
  var theme = {};

  theme.colors = {
    main: '#0082dc',
    border: '#ccc',
  };

  theme.borderStyle = '1px solid ' + theme.colors.border;

  absurd.register('theme', theme);

  absurd.addStyle(function (api) {
    var css = {};

    css['.clearfix'] = {
      '*zoom': 1,
      '&:before, &:after': {
        display: 'table',
        content: '',
        lineHeight: 0,
      },
      '&:after': {
        clear: 'both',
      },
    };

    return css;
  });

})();
