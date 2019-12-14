# Decentralized Web Chat

Work in progress. Purely static web app, for P2P communication.

[Limited functionality demo](https://darenliang.github.io/decentralized-chat/dist/index)

Currently, it uses the following libraries:

- [PeerJS](https://peerjs.com) (WebRTC wrapper)
- [localForage](https://localforage.github.io/localForage/)
- [Bootstrap](https://getbootstrap.com)
- [Font Awesome](https://fontawesome.com)
- [jQuery](https://jquery.com)

## Installation

To install the necessary node packages, run:

```
npm install
```

To build the js bundle, run:

```
npm run build
```

## Todo

- [x] Draft UI
- [x] Initial prototype
- [x] Migrate to TypeScript
- [ ] Proper error handling
- [ ] Backup messages to local storage
- [ ] Sync messages from local storage
- [ ] Local storage encryption
- [ ] Chat rooms
- [ ] Simple name server
