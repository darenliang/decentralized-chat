# Planned Database Format

This markdown file defines how the content is stored locally in the browser. This will be modified according to changes in implementation.

```javascript
let message = {
    author: string,
    timestamp: new Date(),
    unique: Math.random(),
    content: string,
}
```

```javascript
// id are generated using Date.getTime() + Math.random()
let room = {
    1234567890: message,
    2345678901: message,
    ...
}
```

```javascript
// hashes are determined by hashCode(peer.id + ":" + conn.peer)
let database = {
    1234567890: room,
    2345678901: room,
    ...
}
```