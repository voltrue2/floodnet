# fooldnet

A Mesh Network module for node.js that uses redis.

## How To Install

```
npm install floodnet
```

## API

#### .setup(config [*object], callback [function])

You **MUST** call this function in order to start the module correctly.

If `config` object is not given, the module will run with default values.

##### Config Object

```
{
	host: '127.0.0.1', // default
	port: 6379, // default
	prefix: '__floodnet__' // default
	reconnect: true // default
	heartbeatInterval: 0 // default
	logger: null // default
	options: null // default
}
```

###### `host` is the IP address that redis is running.

###### `port` is the port number that redis is listening to.

###### `prefix` is a string value to be used as a prefix for redis' pubsub key.

###### `reconnect` is a boolean value to switch on/off auto-reconnecting when the connection to redis is unexpectedly closed.

###### `heartbeatInterval` is a interval number in millisecond to check the availability of other mesh nodes in the same channel. By setting this to 0, you can turn this feature off.

###### `logger` is a logging module object that can be given to log internal logs.

**NOTE:** Supported logging modules:

1. <a href="https://www.npmjs.com/package/winston" target="_blank">winston</a>

2. <a href="https://www.npmjs.com/package/log4js">log4js</a>

3. <a href="https://www.npmjs.com/package/gracelog">gracelog</a>

Example for winston:

```javascript
var winston = require('winston');
var flood = require('floodnet');
var config = {
	logger: winston
};
flood.setup(config, function () {

});
```

Example for log4js:

```javascript
var log4 = require('log4js');
var flood = require('floodnet');
var config = {
	logger: log4.getLogger()
};
flood.setup(config, function () {

});
```

Example for winston:

```javascript
var gracelog = require('gracelog');
var flood = require('floodnet');
var config = {
	logger: gracelog.create()
};
flood.setup(config, function () {

});
```

###### `options` is an object to configure redis client. The details are shown below.

##### Option Object

These optional values are used to optionally configure redis driver.

```
options: {
        parser: [javascript]
        return_buffers: [bool] // default to false: returns buffer all commands
        detect_buffers: [bool] // default to false: returns buffer per command
        socket_nodelay: [bool] // defaults to true: if set to false, it will not call setNoDelay() on the TCP stream resulting in more throughput at the cost of more latency
        socket_keepalive: [bool] // defaults to true
        no_ready_check: [bool] // defaults to false
        enable_offline_queue: [bool] // defaults to true
        retry_max_delay: [number] // defaults to null: provided in milliseconds
        connet_timeout: [number] // defaults to false: provided in milliseconds
        max_attemps: [number] // defaults to null
        auth_pass: [string] // defaults to null
        family: [string] // defaults to IPv4
}
```

***

#### .id()

Returns a unique ID of floodnet module. 

This ID is unique per process.

***

#### .subscribe(channel [string], handler [function])

Joins a meshnet work channel.

`handler` function will be called on each message recieved in the channel from the other mesh nodes.

**NOTE**: When your application process successfully subscribes to a channel, it will publish a `hello` message to the other mesh nodes in the channel.

##### handler function

The module will be passing 2 arguments to `handler` function on each message recieved.

- key [string]: A key that is used to handle pub/sub for the message recieved.

- message [object]: A published message from another mesh node in the same channel.

##### message object

```
{
	id: 'xxxxxx-yyyyyyy-zzzzzzz' // an ID of the mesh node that published the message
	data: ''/{} // a data that is sent either a string or an object
}
```

***

#### .unsubscribe(channel [string])

Leaves the channel and stops revieving messages from the other mesh nodes.

***

#### .publish(channel [string], message [mix])

Sends a message to the other nodes in the same channel.

`message` can either be a string or an object.

***

#### .exit(callback [function])

Gracefully closes the connection to redis and stops all pub/sub operations.

This function waits for all pending messages in the memory before it terminates the connection to redis.

***

## Events

`floodnet` module emits some events.

#### connect

`connect` event is emitted when the module is connected to redis and is ready to send and recieve packets.

The listener callback will have a string passed from the event.  

The string values are either `pub` or `sub` to indicate either publish connection or subscribe connection.

**NOTE**: When the module is set up, both `pub` and `sub` will be emitted.

```javascript
var flood = require('floodnet');
flood.on('connect', function (type) {
	console.log(type);
});
```

#### end

`end` event will be emitted when the module is closing the connection to redis. 

Calling `.exit()` will also cause this event to be emitted.

The listener callback will have a string passed from the event.  

The string values are either `pub` or `sub` to indicate either publish connection or subscribe connection.

**NOTE**: When the module is closing the connections, both `pub` and `sub` will be emitted.

```javascript
var flood = require('floodnet');
flood.on('end', function (type) {
	console.log(type);
});
```

#### nodeAdded

`nodeAdded` event will be emitted when there is a new mesh node in the same channel.

The listener callback will have 1 argument which is the ID of the new added mesh node.

**NOTE:** Even if `heartbeatInterval` is set to 0, this event WILL be emitted

```javascript
var flood = require('floodnet');
flood.on('nodeAdded', function (newNodeId) {
	// do something
});
```

#### nodeRemoved

`nodeRemoved` event will be emitted when a mesh node in the same channel has timed out and considered offline.

The listener callback will have 1 argument which is the ID of the removed mesh node.

**NOTE:** Even if `heartbeatInterval` is set to 0, this event WILL be emitted

```javascript
var flood = require('floodnet');
flood.on('nodeRemoved', function (newNodeId) {
	// do something
});
```

#### error

`error` event will be emitted when there is an exception or when the module loses its connection to redis unexpectedly.

The listener callback will have 2 arguments passed. The first argument is an error object and the second argument is the connection type (pub/sub). 

```javascript
var flood = require('floodnet');
flood.on('error', function (error, type) {
	console.error(error, type);
});
```

***
