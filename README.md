


# InterSock

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [InterSock](#intersock)
  - [( Logging ≻ Tracing ) ⩰ Messaging](#-logging-%E2%89%BB-tracing--%E2%A9%B0-messaging)
  - [Elementary Exchanges (EXes)](#elementary-exchanges-exes)
  - [RPC Message Format](#rpc-message-format)
  - [RPC API](#rpc-api)
- [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# InterSock

facilitate communication and remote procedure calls (RPC) between browser and server

## ( Logging ≻ Tracing ) ⩰ Messaging

* One shouldn't `log()` unstructured lines of text with interpolated data in haphazard ways, one should
  [`trace()` structured data](https://andydote.co.uk/2023/09/19/tracing-is-better/) that can be parsed and
  searched.
* Let's take the 'message' in 'trace messages' seriously: 'logging' (as in 'started server', 'finished
  processing step C') is no different from 'messaging the remote party' except for the 'other party' being
  (a specific part of) the app itself, or else a third party specializing in listening and recording and /
  or showing those 'messages to self'.

## Elementary Exchanges (EXes)

* In contrast to (classical) HTTP(S) (where each elementary conversation has to be initiated by the client),
  WebSocket communication is normally bidirectional (both client and server can send messages) but not
  conversational (there's no built-in mechanism to deal with request / response patterns). InterSock
  implements this capability to enable remote procedure calls (RPCs) with results.

* An elementary conversation always consists of one 🠉request together with its corresponding 🠋response.

* WebSocket communication is asynchronous, so any message may be sent from either side at any time;
  therefore, sending a request and then waiting for 'the' response is not possible as with HTTP(S) since the
  next message arriving from the other side could be the response to some other request from the client, or
  be an RP call, or a data transmission. To sort out the right piece of data from the stream of messages,
  IDs are used.

* Each 🠉request must have a Message ID (MID) which is controlled at the discretion of the sender; each
  🠋response by the receiving side must use the same property key as the 🠉request's MID with the same value
  in its payload so the request can be properly recognized by the 🠉request sender.

* The ID schema allows for any number of 🠋responses for any 🠉request; this is useful e.g. for streaming an
  indeterminate number of data items in response to a single request. Foundational principles:

  * **An elementary conversation has always exactly one 🠉request and one 🠋response**. Even FYI and error
    messages will be recepted with an ACK message.

  * The 🠋response may indicate that it is the leader of a stream, i.e. an indeterminate number of follow-up
    messages that may or may not arrive in the future.

  * In case of streaming:

    * Follow-up messages to a streaming 🠋response should get their own name and / or type.

    * The sender of the original 🠉request may call streaming off by sending an appropriate message (format
      TBD; might be standardized, must contain MID; might be specialized property value of the 🠋response).

    * The sender of the streaming data may indicate end-of-stream (EOS) by sending an appropriate message
      (as above, format TBD).

  * Also possible to initiate 🠉request-streaming, that is, one side sends a message that tells the receiver
    to prepare for an indeterminate number of follow-ups.


## RPC Message Format

* **`exid`**: *Elementary eXchange ID* (`text`):
  * Has three fields:
    * a producer ID: `c` for the client (browser), `s` for the server,
    * a float representing a UNIX epoch-based UTC timestamp in milliseconds with zero-padded microsecond
      resolution (ex. `1693992062544.400`), and
    * a three-digit, zero-left-padded, zero-based counter (which will be `000` or `001` in almost all
      realistic cases).
    * The two last fields are produced by
      [`webguy.time.stamp_and_count()`](https://github.com/loveencounterflow/webguy#time)
  * fields are separated by colons, ex. `c:1693924247557.709:001`
  * Advantage of this format is that even after restarting, EXIDs will continue to be sortable by time and
    will remain free of collisions. Since UTC is used rather than local time, EXIDs are not affected by time
    zone changes (daylight saving time, travel). It will even be possible to sort events from both
    participants (client and server) in a single table, either under the assumption that both had
    sufficiently synchronized clocks, or based on a measured delta between the two.

  <del>When the client initiates a conversation, the client must set the CMID; when the server sends back a
  `result` or an `ack`, the server must use the same CMID under the same key, `cmid`; an SMID is not to be
  set in either message. Vice versa when the server starts a conversation: the server has to obtain a new
  SMID and set the `smid` property, and so forth.</del>


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


# To Do

* **[–]** define format and resolution for UTC timestamp


