
(function add_theme_styles () {
  var theme = {};

  theme.colors = {
    main: '#0082dc',
    border: '#ccc',
  };

  theme.borderStyle = '1px solid ' + theme.colors.border;

  absurd.register('theme', theme);

})();
