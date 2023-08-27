(function() {
  'use strict';
  var Intersock, WS, demo_websocket;

  //###########################################################################################################
  WS = require('ws');

  //===========================================================================================================
  this.Intersock = Intersock = class Intersock {
    //---------------------------------------------------------------------------------------------------------
    constructor(server, ...targets) {
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