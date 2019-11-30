(function () {
    var peer = null;
    var lpeer = null;
    var conn = null;
    var uid = document.getElementById("uid");
    var rid = document.getElementById("rid");
    var ridButton = document.getElementById("rid-button");
    var status = document.getElementById("status");
    var message = document.getElementById("message");
    var messageButton = document.getElementById("sendMessage");

    /**
     * Create the Peer object for our end of the connection.
     *
     * Sets up callbacks that handle any events related to our
     * peer object.
     */
    function initialize() {
        // Create own peer object with connection to shared PeerJS server
        peer = new Peer(null);
        peer.on('open', function (id) {
            // Workaround for peer.reconnect deleting previous id
            if (peer.id === null) {
                console.log('Received null id from peer open');
                peer.id = lpeer;
            } else {
                lpeer = peer.id;
            }
            console.log('ID: ' + peer.id);
            rid.innerHTML = "ID: " + peer.id;
            status.innerHTML = "Awaiting connection...";
        });
        peer.on('connection', function (c) {
            // Allow only a single connection
            if (conn) {
                c.on('open', function () {
                    c.send("Already connected to another client");
                    setTimeout(function () {
                        c.close();
                    }, 500);
                });
                return;
            }
            conn = c;
            console.log("Connected to: " + conn.peer);
            status.innerHTML = "Connected"
            ready();
        });
        peer.on('disconnected', function () {
            status.innerHTML = "Connection lost. Please reconnect";
            console.log('Connection lost. Please reconnect');
            // Workaround for peer.reconnect deleting previous id
            peer.id = lastPeerId;
            peer._lastServerId = lastPeerId;
            peer.reconnect();
        });
        peer.on('close', function () {
            conn = null;
            status.innerHTML = "Connection destroyed. Please refresh";
            console.log('Connection destroyed');
        });
        peer.on('error', function (err) {
            console.log(err);
            alert('' + err);
        });
    }
    /**
     * Triggered once a connection has been achieved.
     * Defines callbacks to handle incoming data and connection events.
     */
    function ready() {
        conn.on('data', function (data) {
            console.log("Data recieved");
            var cueString = "<span class=\"cueMsg\">Cue: </span>";
            switch (data) {
                case 'Go':
                    go();
                    addMessage(cueString + data);
                    break;
                case 'Fade':
                    fade();
                    addMessage(cueString + data);
                    break;
                case 'Off':
                    off();
                    addMessage(cueString + data);
                    break;
                case 'Reset':
                    reset();
                    addMessage(cueString + data);
                    break;
                default:
                    addMessage("<span class=\"peerMsg\">Peer: </span>" + data);
                    break;
            }
            ;
        });
        conn.on('close', function () {
            status.innerHTML = "Connection reset<br>Awaiting connection...";
            conn = null;
            start(true);
        });
    }

    function addMessage(msg) {
        var now = new Date();
        var h = now.getHours();
        var m = addZero(now.getMinutes());
        var s = addZero(now.getSeconds());
        if (h > 12)
            h -= 12;
        else if (h === 0)
            h = 12;

        function addZero(t) {
            if (t < 10)
                t = "0" + t;
            return t;
        };
        message.innerHTML = "<br><span class=\"msg-time\">" + h + ":" + m + ":" + s + "</span>  -  " + msg + message.innerHTML;
    }

    function clearMessages() {
        message.innerHTML = "";
        addMessage("Msgs cleared");
    }

    // Listen for enter
    sendMessageBox.onkeypress = function (e) {
        var event = e || window.event;
        var char = event.which || event.keyCode;
        if (char == '13')
            sendButton.click();
    };
    // Send message
    sendButton.onclick = function () {
        if (conn.open) {
            var msg = sendMessageBox.value;
            sendMessageBox.value = "";
            conn.send(msg);
            console.log("Sent: " + msg)
            addMessage("<span class=\"selfMsg\">Self: </span>" + msg);
        }
    };
    // Clear messages box
    clearMsgsButton.onclick = function () {
        clearMessages();
    };
    initialize();
})();