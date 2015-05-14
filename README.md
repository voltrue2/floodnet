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
	options: null // default
}
```

###### `host` is the IP address that redis is running.

###### `port` is the port number that redis is listening to.

###### `prefix` is a string value to be used as a prefix for redis' pubsub key.

###### `reconnect` is a boolean value to switch on/off auto-reconnecting when the connection to redis is unexpectedly closed.

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

***
