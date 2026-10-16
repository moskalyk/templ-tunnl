import { createServer } from 'node:http';

const WebSocket = require('ws');

// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {


const routedServer = createServer(async (req, res) => {
  const { url, method } = req;
  
  if (url === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const response = await fetch('http://localhost:3001/get')
    ws.send(await response.text());
    
     // Message event handler
      ws.on('message', (message) => {
         res.end(message);
      });
  } 
  else if (url === '/api/users' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: 'Alice' }]));
  }
  else if (url === '/api/users' && method === 'POST') {
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User created' }));
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

routedServer.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});


}); 



console.log('WebSocket server is running on ws://localhost:8080');

// Connection event handler
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Send a welcome message to the client
  // ws.send('Welcome to the WebSocket server!');

  // Message event handler
  // ws.on('message', (message) => {
  //   console.log(`Received: ${message}`);
  //   // Echo the message back to the client
  //   ws.send(`Server received: ${message}`);
  // });

  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
}); 
