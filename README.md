


# InterSock

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [InterSock](#intersock)
  - [RPC Message Format](#rpc-message-format)
  - [RPC API](#rpc-api)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# InterSock

facilitate communication and remote procedure calls (RPC) between browser and server

## RPC Message Format

* **`cmid`**, **`smid`** (`text`): *Client Message ID* (CMID) and *Server Message ID* (SMID); these are
  counters that start at an arbitrary integer and are incremented for each subsequent request. Both may or
  may not restart when clients get disconnected or a server is restarted. Since CMIDs and SMIDs are used to
  recognize the response to a `call()`, this entails that, under abnormal conditions, wrong pairings between
  request and response may occur, however unlikely.

* **`type`**
  * informational
    * `'fyi'`: *For Your Information*; a package of expected or unsolicited data. No result is expected.
    * `'ack'`: *Acknowledge*. Sent by the receiver of an `fyi` message. The message is there so senders have
      something to `await` for before proceding; `'ack'` tells the sender that the listener has seen and
      processed the data to the point where it is ready, e.g. to receive the next piece of data.
  * RPC
    * `'call'`: *Call a method*
    * `'result'`: *Result of a `call`*.
  * Error
    * `'error'`: *Error*. Ex.: `{ cmid: 234, }`

* **`k`** (`text`): The application-dependent ***k**ey*. In case of `type: 'error'`, the key should spell
  out the type of the error.

* **`v`** (`list`, `object`, or `null`): *Parameters*. If `prms` is a list, it will be applied with the
  spread operator to the receiving method. If it is an object, it will be used as the only argument (i.e. as
  if it was the sole element in a list). If `prms` is missing or `null`, it will be treated as an empty list
  (i.e. the method will be called without arguments).

  In most cases, passing a single object with named keys should be preferred over sending a list of
  positional values. Specifically, when `type` is `'error'`, the value should have a property `message` that
  gives details about the error's cause.

## RPC API

* **`send: () ->`**: Sends a message of type `fyi`
