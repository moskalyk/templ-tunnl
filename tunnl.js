// Creates a new WebSocket connection to the specified URL.
const socket = new WebSocket('ws://localhost:8080');

// Executes when the connection is successfully established.
socket.addEventListener('open', event => {
  console.log('WebSocket connection established!');
  // Sends a message to the WebSocket server.
  process.env.ACTION && socket.send(JSON.stringify({action: 'register', url: `http://localhost:${process.env.PORT}/get`}));
});

// Listen for messages and executes when a message is received from the server.
socket.addEventListener('message', async event => {
    const res = JSON.parse(event.data.toString());
    if(res.msg == 'id'){
        console.log(`use id: ?id=${res.id} in request`)
    } else {
        const response = await fetch(res.url)
        socket.send(JSON.stringify(await response.json()));
    }
});

// Executes when the connection is closed, providing the close code and reason.
socket.addEventListener('close', event => {
  console.log('WebSocket connection closed:', event.code, event.reason);
});

// Executes if an error occurs during the WebSocket communication.
socket.addEventListener('error', error => {
  console.error('WebSocket error:', error);
});
