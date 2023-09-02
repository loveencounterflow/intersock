

'use strict'


############################################################################################################
WGUY                      = require 'webguy'
{ log
  debug }                 = console


#===========================================================================================================
@Intersock = class Intersock

  #---------------------------------------------------------------------------------------------------------
  constructor: ( providers... ) ->
    ### TAINT hardcoding address for the time being ###
    @providers  = providers
    @state      =
      last_id:      0
    debug '^24343^', providers
    debug '^24343^', ( WGUY.props.public_keys p ) for p in providers
    host        = 'localhost'
    port        = 5500 + 1
    url         = "ws://#{host}:#{port}/ws"
    ### TAINT use @cfg ###
    if globalThis.WebSocket?  then  @_create_client { host, port, url, }
    else                            @_create_server { host, port, url, }
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _create_client: ({ host, port, url, }) ->
    @_ws_client = @_ws = new WebSocket url
    #.......................................................................................................
    @_ws_client.addEventListener 'open', ( event ) =>
      log "Opened WebSocket connection:", event.data
      @_ws_client.send JSON.stringify { $key: 'info', $value: "helo from client", }
      return null
    #.......................................................................................................
    @_ws_client.addEventListener 'message', (event) =>
      log "Received message from server ", event.data
      return null
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  _create_server: ({ host, port, url, }) ->
    ### TAINT here we can use guy ###
    WS          = require 'ws'
    @_ws_server = @_ws = new WS.WebSocketServer { port, }
    @_ws_server.on 'connection', connection = ( ws ) =>
      #.....................................................................................................
      ws.on 'error',    ( P... ) =>
        console.error P
        return null
      #.....................................................................................................
      ws.on 'message',  ( d ) =>
        d = JSON.parse d
        log 'received: %s', d
        ws.send JSON.stringify { received: d, }
        return null
      #.....................................................................................................
      debug '^233453^', "Intersock WebSocketServer connected on #{url}"
      ws.send "helo from #{url}"
      return null
    #.......................................................................................................
    debug '^233453^', "Intersock WebSocketServer listening on #{url}"
    return null

  #---------------------------------------------------------------------------------------------------------
  _next_id: -> @state.last_id++

  #---------------------------------------------------------------------------------------------------------
  send: ( $value ) -> new Promise ( resolve, reject ) =>
    id  = @_next_id()
    d   = { id, $key: 'send', $value, }
    handler = ( event ) =>
      debug '^32439423874^', event.data
      d = JSON.parse event.data
      @_ws.removeEventListener 'message', handler
      resolve d
    ### TAINT only valid for client-side code ###
    @_ws.addEventListener 'message', handler
    @_ws.send JSON.stringify d

