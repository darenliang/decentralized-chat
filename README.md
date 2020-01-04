# Decentralized Web Chat

Work in progress.

Note: Decentralized Web Chat only works on WebRTC enabled browsers

[Limited functionality demo](https://darenliang.github.io/decentralized-chat/dist/index)

Currently, it uses the following libraries:

- [PeerJS](https://peerjs.com)
- [localForage](https://localforage.github.io/localForage/)
- [Bootstrap](https://getbootstrap.com)
- [Font Awesome](https://fontawesome.com)
- [jQuery](https://jquery.com)

## Installation

To install the necessary node packages:

```
npm install
```

To build the js bundle:

```
npm run build
```

Compiled files are found in the `dist` folder.

## Todo

- [x] Draft UI
- [x] Initial prototype
- [x] Migrate to TypeScript
- [ ] Use React
- [ ] Proper error handling
- [ ] Backup messages to local storage
- [ ] Sync messages from local storage
- [ ] Local storage encryption
- [ ] Chat rooms
- [ ] Simple name server
