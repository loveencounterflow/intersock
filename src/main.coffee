

'use strict'


############################################################################################################
WGUY                      = require 'webguy'
{ rpr }                   = WGUY.trm
{ log
  debug }                 = console


#===========================================================================================================
defaults =
  host:         'localhost'
  port:         5500 + 1
  _in_browser:  WGUY.environment.browser

#===========================================================================================================
@Intersock = class Intersock

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    # @providers  = providers
    # debug '^24343^', providers
    # debug '^24343^', ( WGUY.props.public_keys p ) for p in providers
    @state          = { last_id: 0, }
    cfg             = { defaults..., cfg..., }
    cfg.url         = "ws://#{cfg.host}:#{cfg.port}/ws"
    cfg._in_browser = globalThis.WebSocket?
    @cfg            = Object.freeze cfg
    debug '^Intersock.constructor@1^', @cfg
    @_ws            = null
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _next_id: -> @state.last_id++

  #---------------------------------------------------------------------------------------------------------
  send: ( $value ) -> new Promise ( resolve, reject ) =>
    id  = @_next_id()
    d   = { id, $key: 'send', $value, }
    handler = ( data_ui8a ) =>
      debug '^intersock.send/handler@1^', @constructor.name, ( typeof data_ui8a ), ( Object::toString.call data_ui8a )
      d = @_parse_message data_ui8a
      @_ws.removeEventListener 'message', handler
      resolve d
    ### TAINT only valid for client-side code ###
    @on 'message', handler
    @_ws.send JSON.stringify d
    return null

  #---------------------------------------------------------------------------------------------------------
  on: ( P... ) -> ( if @cfg._in_browser then @_ws.addEventListener else @_ws.on ).apply @_ws, P

  #---------------------------------------------------------------------------------------------------------
  _parse_message: ( data ) ->
    try
      data  = data.data       if @cfg._in_browser
      data  = data.toString() if ( typeof data ) isnt 'string'
      R     = JSON.parse data
    catch error
      debug '^intersock@1^', "ERROR", error.message
      R = { $value: data, error: error.message, }
    return R


#===========================================================================================================
@Intersock_server = class Intersock_server extends Intersock

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super cfg
    @serve()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  serve: ->
    ### TAINT here we can use guy ###
    resolved    = false
    WS          = require 'ws'
    @_ws_server = new WS.WebSocketServer { port: @cfg.port, }
    @_ws_server.on 'connection', connection = ( ws ) =>
      @_ws = ws
      #.....................................................................................................
      @_ws.on 'error',    ( P... ) =>
        console.error P
        return null
      #.....................................................................................................
      @_ws.on 'message',  ( d ) =>
        d = JSON.parse d
        log "^Intersock_server/on_message@1^ server received: #{rpr d}"
        ws.send JSON.stringify { received: d, }
        return null
      #.....................................................................................................
      debug '^233453^', "Intersock WebSocketServer connected on #{@cfg.url}"
      @send "helo from #{@cfg.url}"
      return null
    #.......................................................................................................
    debug '^233453^', "Intersock WebSocketServer listening on #{@cfg.url}"
    return null


#===========================================================================================================
@Intersock_client = class Intersock_client extends Intersock

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super cfg
    return undefined

  #---------------------------------------------------------------------------------------------------------
  send: ( $value ) ->
    await @connect() if @connect? and not @_ws?
    await super $value

  #---------------------------------------------------------------------------------------------------------
  connect: -> new Promise ( resolve, reject ) =>
    if @cfg._in_browser then  @_ws_client = @_ws = new globalThis.WebSocket @cfg.url
    else                      @_ws_client = @_ws = new ( require 'ws' ).WebSocket @cfg.url
    debug '^start@3^', @constructor.name, typeof @_ws
    #.......................................................................................................
    @on 'open', =>
      log "Connected to server", @cfg.url
      @_ws_client.send JSON.stringify { $key: 'info', $value: "helo from client", }
      resolve null
    #.......................................................................................................
    @on 'message', ( data_ui8a ) =>
      # debug '^Intersock_client.on/message@1^', @constructor.name, ( typeof data_ui8a ), ( Object::toString.call data_ui8a )
      d = @_parse_message data_ui8a
      log "^Intersock_client/on_message@1^ client received: #{rpr d}"
      return null
    #.......................................................................................................
    return null

