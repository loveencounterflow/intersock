


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
  recognize the response to a `call`, this entails that, under abnormal conditions, wrong pairings between
  request and response may occur, however unlikely. When the client initiates a conversation, the client
  must set the CMID; when the server sends back a `result` or an `ack`, the server must use the same CMID
  under the same key, `cmid`; an SMID is not to be set in either message. Vice versa when the server starts
  a conversation: the server has to obtain a new SMID and set the `smid` property, and so forth.

* **`type`**

  * **Informational**:

    🠉 `'fyi'`: *For Your Information*; a package of expected or unsolicited data. No result is expected.

    🠋 `'ack'`: *Acknowledge*. Sent by the receiver of an `fyi` message. The message is there so senders have
      something to `await` for before proceding; `'ack'` tells the sender that the listener has seen and
      processed the data to the point where it is ready, e.g. to receive the next piece of data.

  * **Call Method**:

    🠉 `'call'`: *Call a method*

    🠋 `'result'`: *Result of a `call`*.

  * **Error**:

    🠉 `'error'`: *Error*. Ex.: `{ cmid: 234, type: 'error', key: 'division-by-zero', value: { lnr: 24, ...,
      }, }`

    🠋 An error message from either side should be acknowledged with an `ack` message. This is mainly so that
      behavior remains consistent with `fyi` (i.e. all messages will be acknowledged or replied to by either
      side).

* **`key`** (`text`): The application-dependent *key*.

  * **In case of `type: 'error'`**, the key should spell out the application-dependent type name of the
    error.

* **`value`** (`any`): The application-dependent *value*.

  * **In case of `type: 'call'`**, the value should spell out the arguments for the method call.

    (`list`, `object`, or `null`): *Parameters*. If `prms` is a list, it will be applied with the spread
    operator to the receiving method. If it is an object, it will be used as the only argument (i.e. as if
    it was the sole element in a list). If `prms` is missing or `null`, it will be treated as an empty list
    (i.e. the method will be called without arguments).

    In most cases, passing a single object with named keys should be preferred over sending a list of
    positional values. Specifically, when `type` is `'error'`, the value should have a property `message`
    that gives details about the error's cause.

  * **In case of `type: 'error'`**, the optional value may contain additional details such as filename,
    linenumber, offending value, &c.

## RPC API

* **`send: () ->`**: Sends a message of type `fyi`, may `await` an `ack`.
* **`call: () ->`**: Initiates a remote procedure call (RPC), may `await` the `result`.
* **`err: () ->`**: Sends a message of type `error`, may `await` an `ack`.
