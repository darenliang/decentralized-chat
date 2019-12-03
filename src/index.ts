import Peer from 'peerjs';
import $ from 'jquery';

// On document load
$(document).ready(function () {
    let peer: Peer = null;
    let last_peer: string = null;
    let conn: Peer.DataConnection = null;

    // Create message object
    function createMessage(content: string): object {
        return {author: peer.id, timestamp: new Date().getTime(), content: content}
    }

    // Create room object
    function createRoom(): object {
        return {self: peer.id, peer: conn.peer, messages: {}}
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
        });

        conn.on('data', function (msg: any) {
            // TODO: Properly handle different types of objects
            addMessage(msg);
        });

        conn.on('close', function () {
            conn = null;
            setStatus('Connection closed', 'yellow');
        });
    }

    // Add message to html
    function addMessage(msg: any) {
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

        let msg: object = createMessage(peer.id, text);

        if (conn.open) {
            conn.send(msg);
            addMessage(msg);
        }

        $('#messageText').val("");
    });

    initialize();
});