// On document load
$(document).ready(function () {
    let peer = null;
    let lpeer = null;
    let conn = null;

    // Set status
    function setStatus(status, newColor) {
        $('#status').text(status);
        var colors = ['green', 'yellow', 'red'];
        colors.forEach(function (item, _, _) {
            if (newColor == item) {
                $('#status-icon').addClass(item + '-color')
            } else {
                $('#status-icon').removeClass(item + '-color')
            }
        });
    }

    // Set status connecte
    function setConnected() {
        setStatus('Connected', 'green')
    }

    // Set status disconnected
    function setDisconnected() {
        setStatus('Not Connected', 'red')
    }

    // Get timestamp
    function getTimestamp() {
        function addZero(t) {
            if (t < 10)
                t = '0' + t;
            return t;
        }

        const now = new Date();
        let h = now.getHours();
        const m = addZero(now.getMinutes());
        const s = addZero(now.getSeconds());

        if (h > 12) {
            h -= 12;
        } else if (h === 0) {
            h = 12;
        }

        return h + ':' + m + ':' + s;
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
        peer.on('open', function (_) {
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

            // Get connection ready
            ready();
        });

        // Connect via RID
        $('#rid-button').click(function () {
            // Close current connection
            if (conn) {
                conn.close();
            }

            // Connect to RID
            conn = peer.connect($('#rid').val(), {
                reliable: true
            });

            ready();
        });

        // On Peer disconnection
        peer.on('disconnected', function () {
            // Change status
            setStatus('Disconnected', 'yellow');

            // Attempt to reconnect
            peer.id = lpeer;
            peer.reconnect();
        });

        peer.on('close', function () {
            // Prompt refresh
            conn = null;
            setStatus('Client closed (Please refresh)', 'red');
        });

        peer.on('error', function (err) {
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
        })

        conn.on('data', function (data) {
            switch (data.type) {
                case 'msg':
                    addMessage('Peer', data.content);
                    break;
            }
        });

        conn.on('close', function () {
            conn = null;
            setStatus('Connection closed', 'yellow');
        });
    }

    // Add message to html
    function addMessage(author, msg) {
        let authorSpan = "";
        switch (author) {
            case 'Peer':
                authorSpan = '<span class=\"red-color\"> - Peer : </span>';
                break;
            case 'Self':
                authorSpan = '<span class=\"green-color\"> - Self : </span>';
                break;
        }

        $('#messageBox').append('<p><span class=\"blue-color\">' + getTimestamp() + '</span>' + authorSpan + '<span>' + msg + '</span></p>');
        $('#messageContainer').animate({
            scrollTop: $('#messageContainer').prop("scrollHeight")
        }, 0);
    }

    // Click button from enter key press on text box
    $('#messageText').keypress(function (e) {
        if (e.which === 13) {
            $("#messageSend").click();
            return false;
        }
    });

    // Send message
    $('#messageSend').click(function () {
        const msg = $('#messageText').val();
        if (msg === "") {
            return;
        }

        let data = {type: 'msg', content: msg};

        if (conn.open) {
            conn.send(data);
            addMessage('Self', msg);
        }

        $('#messageText').val("");
    });

    initialize();
});