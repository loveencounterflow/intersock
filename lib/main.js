(function() {
  'use strict';
  var Intersock, WGUY, debug, log;

  //###########################################################################################################
  WGUY = require('webguy');

  ({log, debug} = console);

  //===========================================================================================================
  this.Intersock = Intersock = class Intersock {
    //---------------------------------------------------------------------------------------------------------
    constructor(...providers) {
      var host, i, len, p, port, url;
      /* TAINT hardcoding address for the time being */
      this.providers = providers;
      this.state = {
        last_id: 0
      };
      debug('^24343^', providers);
      for (i = 0, len = providers.length; i < len; i++) {
        p = providers[i];
        debug('^24343^', WGUY.props.public_keys(p));
      }
      host = 'localhost';
      port = 5500 + 1;
      url = `ws://${host}:${port}/ws`;
      /* TAINT use @cfg */
      if (globalThis.WebSocket != null) {
        this._create_client({host, port, url});
      } else {
        this._create_server({host, port, url});
      }
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    _create_client({host, port, url}) {
      this._ws_client = this._ws = new WebSocket(url);
      //.......................................................................................................
      this._ws_client.addEventListener('open', (event) => {
        log("Opened WebSocket connection:", event.data);
        this._ws_client.send(JSON.stringify({
          $key: 'info',
          $value: "helo from client"
        }));
        return null;
      });
      //.......................................................................................................
      this._ws_client.addEventListener('message', (event) => {
        log("Received message from server ", event.data);
        return null;
      });
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _create_server({host, port, url}) {
      /* TAINT here we can use guy */
      var WS, connection;
      WS = require('ws');
      this._ws_server = this._ws = new WS.WebSocketServer({port});
      this._ws_server.on('connection', connection = (ws) => {
        //.....................................................................................................
        ws.on('error', (...P) => {
          console.error(P);
          return null;
        });
        //.....................................................................................................
        ws.on('message', (d) => {
          d = JSON.parse(d);
          log('received: %s', d);
          ws.send(JSON.stringify({d}));
          return null;
        });
        //.....................................................................................................
        debug('^233453^', `Intersock WebSocketServer connected on ${url}`);
        ws.send(`helo from ${url}`);
        return null;
      });
      //.......................................................................................................
      debug('^233453^', `Intersock WebSocketServer listening on ${url}`);
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _next_id() {
      return this.state.last_id++;
    }

    //---------------------------------------------------------------------------------------------------------
    send($value) {
      return new Promise((resolve, reject) => {
        var d, handler, id;
        id = this._next_id();
        d = {
          id,
          $key: 'send',
          $value
        };
        handler = (event) => {
          debug('^32439423874^', event.data);
          d = JSON.parse(event.data);
          this._ws.removeEventListener('message', handler);
          return resolve(d);
        };
        /* TAINT only valid for client-side code */
        this._ws.addEventListener('message', handler);
        return this._ws.send(JSON.stringify(d));
      });
    }

  };

}).call(this);

//# sourceMappingURL=main.js.map