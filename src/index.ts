import Peer from 'peerjs';
import $ from 'jquery';
import localForage from 'localforage';

const hashCode = (s: string): number => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);

interface message {
    author: string;
    timestamp: number;
    unique: number;
    content: string;
}

interface room {
    self: string;
    peer: string;
    messages: { [index: number]: message };
}

// On document load
$(document).ready(function () {
    let peer: Peer = null;
    let last_peer: string = null;
    let conn: Peer.DataConnection = null;
    let curr_room: room = null;

    // Create message object
    function createMessage(content: string): message {
        return {author: peer.id, timestamp: new Date().getTime(), unique: Math.random(), content: content}
    }

    // Create room object
    function createRoom(): room {
        return {self: peer.id, peer: conn.peer, messages: {}}
    }

    // Load room
    function loadRoom() {
        localForage.getItem('default-room').then(function (value) {
            if (value) {
                curr_room = value as room;
            } else {
                updateRoom(createRoom());
            }
        }).catch(function (err) {
            alert(err);
            console.log(err);
        });
    }

    function updateRoom(target_room: room) {
        localForage.setItem('default-room', target_room).then(function (_) {
            return;
        }).catch(function (err) {
            console.log(err);
        });
    }

    // Add message to database
    function addMessage(msg: message) {
        const unique_id: number = msg.timestamp + msg.unique;
        curr_room.messages[unique_id] = msg;
        updateRoom(curr_room);
    }

    // Set status
    function setStatus(status: string, newColor: string) {
        $('#status').text(status);
        const colors = ['green', 'yellow', 'red'];
        colors.forEach(function (item) {
            if (newColor === item) {
                $('#status-icon').addClass(item + '-color')
            } else {
                $('#status-icon').removeClass(item + '-color')
            }
        });
    }

    // Get timestamp
    function getTimestamp(ms: number): string {
        function addZero(t: number): string {
            let res: string = null;
            if (t < 10) {
                res = '0' + t;
            } else {
                res = t.toString();
            }
            return res;
        }

        const parsed_date = new Date(ms);
        const h: number = parsed_date.getHours();
        const m: number = parsed_date.getMinutes();
        const s: number = parsed_date.getSeconds();

        let h_res: string = null;
        if (h > 12) {
            h_res = (h - 12).toString();
        } else if (h === 0) {
            h_res = (12).toString();
        } else {
            h_res = h.toString();
        }

        return h_res + ':' + addZero(m) + ':' + addZero(s);
    }

    // Reconnect button
    $('#reconnectButton').click(function () {
        initialize()
    });


    // Setup Peer connection
    function initialize() {
        // Create own Peer connection
        peer = new Peer(null);

        // On Peer open
        peer.on('open', function (_: string) {
            // Detect if Peer id is defined
            if (peer.id === null) {
                console.log('Received null id from Peer connection');
                peer.id = last_peer;
            } else {
                last_peer = peer.id;
            }

            // Display Peer id
            $('#uid').val(peer.id);
        });

        // On Peer connection
        peer.on('connection', function (c: Peer.DataConnection) {
            // Allow only a single connection for now
            if (conn) {
                c.on('open', function () {
                    alert('Already connected to another client');
                    setTimeout(function () {
                        c.close();
                    }, 500);
                });
                return;
            }

            // Save connection
            conn = c;

            // Get connection ready
            ready();
        });

        // On Peer disconnection
        peer.on('disconnected', function () {
            // Change status
            setStatus('Disconnected', 'yellow');

            // Attempt to reconnect
            peer.id = last_peer;
            peer.reconnect();
        });

        peer.on('close', function () {
            // Prompt refresh
            conn = null;
            setStatus('Client closed (Please refresh)', 'red');
        });

        peer.on('error', function (err: any) {
            console.log(err);
            alert('' + err);

            // TODO: Handle all errors
            switch (err.type) {
                case 'peer-unavailable':
                    setStatus('Disconnected', 'yellow');
            }
        });
    }


    // Call when Peer connection is established
    function ready() {
        conn.on('open', function () {
            // Change status and set RID
            setStatus('Connected', 'green');
            $('#rid').val(conn.peer);

            // Load room
            loadRoom();
        });

        conn.on('data', function (msg: message) {
            // TODO: Properly handle different types of objects
            displayMessage(msg);
            addMessage(msg);
        });

        conn.on('close', function () {
            conn = null;
            setStatus('Connection closed', 'yellow');
        });
    }

    // Add message to html
    function displayMessage(msg: message) {
        let authorSpan = "";
        switch (msg.author) {
            case peer.id:
                authorSpan = '<span class=\"red-color\"> - ' + msg.author + ' : </span>';
                break;
            default:
                authorSpan = '<span class=\"green-color\"> - ' + msg.author + ' : </span>';
                break;
        }

        $('#messageBox').append('<p><span class=\"blue-color\">' + getTimestamp(msg.timestamp) + '</span>' + authorSpan + '<span>' + msg.content + '</span></p>');
        $('#messageContainer').animate({
            scrollTop: $('#messageContainer').prop("scrollHeight")
        }, 0);
    }

    // Click button from enter key press on text box
    $('#rid').keypress(function (e) {
        if (e.which === 13) {
            $("#rid-button").click();
            return false;
        }
    });


    // Connect via RID
    $('#rid-button').click(function () {
        // Close current connection
        if (conn) {
            conn.close();
        }

        // Connect to RID
        conn = peer.connect($('#rid').val().toString(), {
            reliable: true
        });

        ready();
    });

    // Click button from enter key press on text box
    $('#messageText').keypress(function (e) {
        if (e.which === 13) {
            $("#messageSend").click();
            return false;
        }
    });

    // Send message
    $('#messageSend').click(function () {
        const text = $('#messageText').val().toString();
        if (text === "") {
            return;
        }

        let msg: message = createMessage(text);

        if (conn.open) {
            conn.send(msg);
            displayMessage(msg);
            addMessage(msg);
        }

        $('#messageText').val("");
    });

    initialize();
});