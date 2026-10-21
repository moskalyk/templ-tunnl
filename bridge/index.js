import { createServer } from 'node:http';

const WebSocket = require('ws');

// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

// id => url
const registry = {
    
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

wss.on('connection', (ws, req) => {
    const id = makeid(7)
    registry[id] = ws
    ws.send(JSON.stringify({msg: 'id', id: id}));
    
    registry[id].on('message', (message) => {
        const jsonParsed = JSON.parse(message.toString())
        if(jsonParsed.action == 'register'){
            console.log('registering', jsonParsed.url)
            registry['url:'+id] = jsonParsed.url
        } 
    });
}); 

const routedServer = createServer(async (req, res) => {
    const { url, method } = req;
    var parser = new URL('http://localhost:3001'+url);
    
    console.log('req', parser.searchParams.get('id'));
    
    if (parser.hostname === 'localhost' && method === 'GET') {
    
        res.writeHead(200, { 'Content-Type': 'text/html' });
        registry[parser.searchParams.get('id')].send(JSON.stringify({msg: 'get', url: registry['url:'+parser.searchParams.get('id')] }));
        
        // Message event handler
        registry[parser.searchParams.get('id')].on('message', (message) => {
            const jsonParsed = JSON.parse(message.toString())
            if(jsonParsed.msg == 'timing'){
                res.end(message);
            }
        });
    } 
});

routedServer.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});


console.log('WebSocket server is running on ws://localhost:8080');

// Connection event handler
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
}); 
