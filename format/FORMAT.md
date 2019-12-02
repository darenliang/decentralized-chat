# Planned Database Format

This markdown file defines how the content is stored locally in the browser. This will be modified according to changes in implementation.

```javascript
let message = {
    id: "001",
    type: "msg",
    timestamp: Date(),
    content: "Hello World!"
}
```

```javascript
let room = {
    messages: [message, message, message, ...]
}
```

```javascript
let database = {
    rooms: [rooms, rooms, rooms, ...]
}
```