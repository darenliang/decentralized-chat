$(document).ready(function () {
    let peer = null;
    let lpeer = null;
    let conn = null;

    // Set status
    function setStatus(status, oldColor, newColor) {
        $('#status').val = status;
        $('#status-icon').removeClass(oldColor).addClass(newColor);
    }

    // Reconnect button
    $('#reconnectButton').click(function () {
        initialize()
    });


    /**
     * Setup Peer connection
     */
    function initialize() {
        // Create own Peer connection
        peer = new Peer(null);

        // On Peer open
        peer.on('open', function (_) {
            $('#rid').val("");
            setStatus('Not connected', 'green-color', 'red-color');

            // Detect if Peer id is defined
            if (peer.id === null) {
                console.log('Received null id from Peer connection');
                peer.id = lpeer;
            } else {
                lpeer = peer.id;
            }

            // Display Peer id
            $('#uid').val(peer.id);
        });

        // On Peer connection
        peer.on('connection', function (c) {
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

            // Change status
            setStatus('Connected', 'red-color', 'green-color');
            $('#rid').val(conn.peer);

            // Get connection ready
            ready();
        });

        // On Peer disconnection
        peer.on('disconnected', function () {
            // Change status
            setStatus('Not Connected', 'green-color', 'red-color');

            // Attempt to reconnect
            peer.id = lpeer;
            peer.reconnect();
        });

        peer.on('close', function () {
            // Prompt refresh
            conn = null;
            setStatus('Please refresh', 'green-color', 'red-color');
        });

        peer.on('error', function (err) {
            // Show error
            console.log(err);
            alert('' + err);
        });
    }

    /**
     * Call when Peer connection is established
     */
    function ready() {
        conn.on('data', function (data) {
            addMessage(data);
        });

        conn.on('close', function () {
            conn = null;
            setStatus('Connection closed', 'green-color', 'red-color');
        });
    }

    function addMessage(msg) {
        const now = new Date();
        let h = now.getHours();
        const m = addZero(now.getMinutes());
        const s = addZero(now.getSeconds());

        if (h > 12)
            h -= 12;
        else if (h === 0)
            h = 12;

        function addZero(t) {
            if (t < 10)
                t = '0' + t;
            return t;
        }

        $('#messageBox').append('<p><span class=\"blue-color\">' + h + ':' + m + ':' + s + '</span><span class=\"green-color\"> Self: </span><span>' + msg + '</span></p>');

        $('#messageContainer').animate({
            scrollTop: $('#messageContainer').prop("scrollHeight")
        });
    }

    $('#messageText').keypress(function (e) {
        if (e.which === 13) {
            $("#messageSend").click();
            return false;
        }
    });

    // Send message
    $('#messageSend').click(function () {
        const msg = $('#messageText').val();
        addMessage(msg);
    });

    initialize();
});