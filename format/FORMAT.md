# Format

This markdown file defines how the content is stored locally in the browser as well as how two peers communicate in message synchronization. This will be modified according to changes in implementation.

Message object:
```javascript
let message = {
    author: string,
    timestamp: new Date(),
    unique: Math.random(),
    content: string,
}
```

Room object:
```javascript
// id are generated using Date.getTime() + Math.random()
let room = {
    1234567890: message,
    2345678901: message,
    ...
}
```

Database object:
```javascript
// hashes are determined by hashCode(peer.id + ":" + conn.peer)
let database = {
    1234567890: room,
    2345678901: room,
    ...
}
```

Single message communication:
```javascript
let transit = {
    type: 'msg',
    content: message,
}
```

Bulk message communication:
```javascript
let transit = {
    type: 'msgs',
    content: [message, message, message, ...]
}
```

Message synchronization:
```javascript
let transit = {
    type: 'hashes',
    content: [all room.keys]
}
```