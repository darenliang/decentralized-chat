# Planned Database Format

This markdown file defines how the content is stored locally in the browser. This will be modified according to changes in implementation.

```javascript
let message = {
    author: string,
    timestamp: Date(),
    content: string,
}
```

```javascript
// id are generated using Date.now() + Math.random()

let room = {
    1234567890: message,
    2345678901: message,
    ...
}
```