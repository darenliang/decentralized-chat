let peer = new Peer();
let conn = null;

peer.on('open', function (id) {
    document.getElementById("uid").innerHTML = "uid: " + id;
});

function setDestination(e) {
    if (event.key === 'Enter') {
        conn = peer.connect(e.value);
    }
}

peer.on('connection', function (conn) {
    alert("Connected!")
});

conn.on('open', function () {
    conn.on('data', function (data) {
        console.log('Received', data);
    });

    // Send messages
    conn.send('Hello!');
});