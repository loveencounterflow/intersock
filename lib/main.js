(function() {
  'use strict';
  var Intersock, Intersock_client, Intersock_server, WGUY, debug, defaults, log;

  //###########################################################################################################
  WGUY = require('webguy');

  ({log, debug} = console);

  //===========================================================================================================
  defaults = {
    host: 'localhost',
    port: 5500 + 1
  };

  //===========================================================================================================
  this.Intersock = Intersock = class Intersock {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      // @providers  = providers
      // debug '^24343^', providers
      // debug '^24343^', ( WGUY.props.public_keys p ) for p in providers
      this.state = {
        last_id: 0
      };
      cfg = {...defaults, ...cfg};
      cfg.url = `ws://${cfg.host}:${cfg.port}/ws`;
      cfg.in_browser = globalThis.WebSocket != null;
      this.cfg = Object.freeze(cfg);
      return void 0;
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
          var error;
          debug('^32439423874^', event.data);
          debug('^32439423874^', this.constructor.name, this._ws.removeEventListener);
          try {
            d = JSON.parse(event.data);
          } catch (error1) {
            error = error1;
            debug('^intersock@2^', "ERROR", error.message);
          }
          this._ws.removeEventListener('message', handler);
          return resolve(d);
        };
        /* TAINT only valid for client-side code */
        this.on('message', handler);
        return this._ws.send(JSON.stringify(d));
      });
    }

    //---------------------------------------------------------------------------------------------------------
    on(...P) {
      return (this.cfg.in_browser ? this._ws.addEventListener : this._ws.on).apply(this._ws, P);
    }

  };

  //===========================================================================================================
  this.Intersock_client = Intersock_client = class Intersock_client extends Intersock {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      super(cfg);
      // @start()
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    start() {
      var WebSocket;
      if (!this.cfg.in_browser) {
        ({WebSocket} = require('ws'));
      }
      this._ws_client = this._ws = new WebSocket(this.cfg.url);
      //.......................................................................................................
      this.on('open', () => {
        log("Connected to server", this.cfg.url);
        this._ws_client.send(JSON.stringify({
          $key: 'info',
          $value: "helo from client"
        }));
        return null;
      });
      //.......................................................................................................
      this.on('message', (data) => {
        var error, message;
        data = data.toString();
        try {
          message = JSON.parse(data);
        } catch (error1) {
          error = error1;
          debug('^intersock@1^', "ERROR", error.message);
          message = {
            $value: data,
            error: error.message
          };
        }
        log("Received message from server", message);
        return null;
      });
      //.......................................................................................................
      return null;
    }

  };

  //===========================================================================================================
  this.Intersock_server = Intersock_server = class Intersock_server extends Intersock {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      super(cfg);
      // @start()
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    start() {
      /* TAINT here we can use guy */
      var WS, connection, resolved;
      resolved = false;
      WS = require('ws');
      this._ws_server = new WS.WebSocketServer({
        port: this.cfg.port
      });
      this._ws_server.on('connection', connection = (ws) => {
        this._ws = ws;
        //.....................................................................................................
        this._ws.on('error', (...P) => {
          console.error(P);
          return null;
        });
        //.....................................................................................................
        this._ws.on('message', (d) => {
          d = JSON.parse(d);
          log('received: %s', d);
          ws.send(JSON.stringify({
            received: d
          }));
          return null;
        });
        //.....................................................................................................
        debug('^233453^', `Intersock WebSocketServer connected on ${this.cfg.url}`);
        this.send(`helo from ${this.cfg.url}`);
        return null;
      });
      //.......................................................................................................
      debug('^233453^', `Intersock WebSocketServer listening on ${this.cfg.url}`);
      return null;
    }

  };

}).call(this);

//# sourceMappingURL=main.js.map