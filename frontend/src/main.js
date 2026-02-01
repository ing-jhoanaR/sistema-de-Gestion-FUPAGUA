const nw = require('nw');

nw.Window.open(
  'index.html',
  {
    width: 1024,
    height: 768,
    resizable: true,
    title: 'Gestión de FUPAGUA',
  },
  function (win) {
    win.on('closed', function () {
      nw.App.quit();
    });
  }
);