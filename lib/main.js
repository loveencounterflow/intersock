(function() {
  'use strict';
  var Intersock, WGUY, WS, debug, demo_websocket;

  //###########################################################################################################
  WS = require('ws');

  WGUY = require('webguy');

  ({debug} = console);

  //===========================================================================================================
  this.Intersock = Intersock = class Intersock {
    //---------------------------------------------------------------------------------------------------------
    constructor(server, ...providers) {
      var i, len, p;
      this.providers = providers;
      for (i = 0, len = providers.length; i < len; i++) {
        p = providers[i];
        debug('^24343^', WGUY.props.public_keys(p));
      }
      this._ws = new WS.WebSocketServer({server});
      return void 0;
    }

  };

  demo_websocket = (host, port) => {
    var url, ws;
    url = `ws://${host}:${port}/ws`;
    ws = new WS.WebSocket(url);
    urge(`^demo_websocket@14^ opening websocket at ${url}`);
    ws.on('open', () => {
      urge(`^demo_websocket@17^ websocket open at ${url}`);
      return ws.send('echo "helo from server"');
    });
    ws.on('message', (data) => {
      urge("^demo_websocket@17^ message", rpr(data));
      return null;
    });
    return null;
  };

}).call(this);

//# sourceMappingURL=main.js.map