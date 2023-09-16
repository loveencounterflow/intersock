(function() {
  'use strict';
  var Intersock, Intersock_client, Intersock_server, WGUY, debug, defaults, log, rpr;

  //###########################################################################################################
  WGUY = require('webguy');

  ({rpr} = WGUY.trm);

  ({log, debug} = console);

  //===========================================================================================================
  defaults = {
    host: 'localhost',
    port: 5500 + 1,
    _in_browser: WGUY.environment.browser
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
      cfg._in_browser = globalThis.WebSocket != null;
      this.cfg = Object.freeze(cfg);
      debug('^Intersock.constructor@1^', this.cfg);
      this._ws = null;
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
        handler = (data_ui8a) => {
          debug('^intersock.send/handler@1^', this.constructor.name, typeof data_ui8a, Object.prototype.toString.call(data_ui8a));
          d = this._parse_message(data_ui8a);
          this._ws.removeEventListener('message', handler);
          return resolve(d);
        };
        /* TAINT only valid for client-side code */
        this.on('message', handler);
        this._ws.send(JSON.stringify(d));
        return null;
      });
    }

    //---------------------------------------------------------------------------------------------------------
    on(...P) {
      return (this.cfg._in_browser ? this._ws.addEventListener : this._ws.on).apply(this._ws, P);
    }

    //---------------------------------------------------------------------------------------------------------
    _parse_message(data) {
      var R, error;
      try {
        if (this.cfg._in_browser) {
          data = data.data;
        }
        if ((typeof data) !== 'string') {
          data = data.toString();
        }
        R = JSON.parse(data);
      } catch (error1) {
        error = error1;
        debug('^intersock@1^', "ERROR", error.message);
        R = {
          $value: data,
          error: error.message
        };
      }
      return R;
    }

  };

  //===========================================================================================================
  this.Intersock_server = Intersock_server = class Intersock_server extends Intersock {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      super(cfg);
      this.serve();
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    serve() {
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
          log(`^Intersock_server/on_message@1^ server received: ${rpr(d)}`);
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

  //===========================================================================================================
  this.Intersock_client = Intersock_client = class Intersock_client extends Intersock {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      super(cfg);
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    async send($value) {
      if ((this.connect != null) && (this._ws == null)) {
        await this.connect();
      }
      return (await super.send($value));
    }

    //---------------------------------------------------------------------------------------------------------
    connect() {
      return new Promise((resolve, reject) => {
        if (this.cfg._in_browser) {
          this._ws_client = this._ws = new globalThis.WebSocket(this.cfg.url);
        } else {
          this._ws_client = this._ws = new (require('ws')).WebSocket(this.cfg.url);
        }
        debug('^start@3^', this.constructor.name, typeof this._ws);
        //.......................................................................................................
        this.on('open', () => {
          log("Connected to server", this.cfg.url);
          this._ws_client.send(JSON.stringify({
            $key: 'info',
            $value: "helo from client"
          }));
          return resolve(null);
        });
        //.......................................................................................................
        this.on('message', (data_ui8a) => {
          var d;
          // debug '^Intersock_client.on/message@1^', @constructor.name, ( typeof data_ui8a ), ( Object::toString.call data_ui8a )
          d = this._parse_message(data_ui8a);
          log(`^Intersock_client/on_message@1^ client received: ${rpr(d)}`);
          return null;
        });
        //.......................................................................................................
        return null;
      });
    }

  };

}).call(this);

//# sourceMappingURL=main.js.map