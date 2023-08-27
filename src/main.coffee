

'use strict'


############################################################################################################
GUY                       = require 'guy'
{ alert
  debug
  help
  info
  plain
  praise
  urge
  warn
  whisper }               = GUY.trm.get_loggers 'intersock'
{ rpr
  inspect
  echo
  log     }               = GUY.trm
#...........................................................................................................
# { isa
#   declare
#   type_of
#   validate
#   equals }                = types
{ after
  defer
  sleep }                 = GUY.async
WS                        = require 'ws'


#===========================================================================================================
@Intersock = class Intersock

  #---------------------------------------------------------------------------------------------------------
  constructor: ( server, targets... ) ->
    @_ws = new WS.WebSocketServer { server, }
    return undefined


demo_websocket = ( host, port ) =>
  url     = "ws://#{host}:#{port}/ws"
  ws      = new WS.WebSocket url
  urge "^demo_websocket@14^ opening websocket at #{url}"
  ws.on 'open', () =>
    urge "^demo_websocket@17^ websocket open at #{url}"
    ws.send 'echo "helo from server"'
  ws.on 'message', ( data ) =>
    urge "^demo_websocket@17^ message", rpr data
    return null
  return null





