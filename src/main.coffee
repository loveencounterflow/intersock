

'use strict'


############################################################################################################
WGUY                      = require 'webguy'
{ log
  debug }                 = console

#===========================================================================================================
defaults =
  host:   'localhost'
  port:   5500 + 1

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
    cfg.in_browser  = globalThis.WebSocket?
    @cfg            = Object.freeze cfg
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _next_id: -> @state.last_id++

  #---------------------------------------------------------------------------------------------------------
  send: ( $value ) -> new Promise ( resolve, reject ) =>
    id  = @_next_id()
    d   = { id, $key: 'send', $value, }
    handler = ( event ) =>
      debug '^32439423874^', event.data
      debug '^32439423874^', @constructor.name, @_ws.removeEventListener
      try d = JSON.parse event.data catch error
        debug '^intersock@2^', "ERROR", error.message
      @_ws.removeEventListener 'message', handler
      resolve d
    ### TAINT only valid for client-side code ###
    @on 'message', handler
    @_ws.send JSON.stringify d

  #---------------------------------------------------------------------------------------------------------
  on: ( P... ) -> ( if @cfg.in_browser then @_ws.addEventListener else @_ws.on ).apply @_ws, P


#===========================================================================================================
@Intersock_client = class Intersock_client extends Intersock

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super cfg
    # @start()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  start: ->
    { WebSocket } = require 'ws' unless @cfg.in_browser
    @_ws_client = @_ws = new WebSocket @cfg.url
    #.......................................................................................................
    @on 'open', =>
      log "Connected to server", @cfg.url
      @_ws_client.send JSON.stringify { $key: 'info', $value: "helo from client", }
      return null
    #.......................................................................................................
    @on 'message', ( data ) =>
      data = data.toString()
      try message = JSON.parse data catch error
        debug '^intersock@1^', "ERROR", error.message
        message = { $value: data, error: error.message, }
      log "Received message from server", message
      return null
    #.......................................................................................................
    return null


#===========================================================================================================
@Intersock_server = class Intersock_server extends Intersock

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super cfg
    # @start()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  start: ->
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
        log 'received: %s', d
        ws.send JSON.stringify { received: d, }
        return null
      #.....................................................................................................
      debug '^233453^', "Intersock WebSocketServer connected on #{@cfg.url}"
      @send "helo from #{@cfg.url}"
      return null
    #.......................................................................................................
    debug '^233453^', "Intersock WebSocketServer listening on #{@cfg.url}"
    return null


