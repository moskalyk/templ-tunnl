#!/usr/bin/env node
const argv = process.argv;
import http from 'node:http';

import { createServer } from 'https';
import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';

const WebSocket = require('ws');

(async () => {
    
    console.log('   >-)    >|) |')
    console.log('')
    console.log(`  templ-tunnl`)
    console.log('')
    
    if(!argv[2]){
        console.log('  \x1b[41mcreate\x1b[0m\tcreate a tunnel')
        console.log('  \x1b[44mstart\x1b[0m\t\tstart a bridge')
        console.log()
        console.log('  --help\t')
        console.log('  about\t\tlearn about the program https://vfaas.net')
        console.log()
        console.log(
            'example 1: npx tsx tunnl create -m POST -ps :3000/availability'
        )
        
        console.log(
            'example 2: npx tsx tunnl start'
        )
    }    
    
    switch(argv[2]){
        case 'create':
            // Creates a new WebSocket connection to the specified URL.
            const socket = new WebSocket('ws://localhost:8080');

            // Executes when the connection is successfully established.
            socket.addEventListener('open', event => {
              console.log('WebSocket connection established!');
              // Sends a message to the WebSocket server.
              socket.send(JSON.stringify({action: 'register', method: argv[4], url: `http://localhost:${argv[6]}`}));
            });

            // Listen for messages and executes when a message is received from the server.
            socket.addEventListener('message', async event => {
                const res = JSON.parse(event.data.toString());
                if(res.msg == 'id'){
                    console.log(`use id: ?id=${res.id} in request`)
                } else {
                    if(res.method == 'post'){
                        const response = await fetch(res.url, {
                            method: 'POST',
                            body: JSON.stringify(res.body)
                        })
                        socket.send(JSON.stringify(await response.json()));
                    } else {
                        const response = await fetch(res.url)
                        socket.send(JSON.stringify(await response.json()));
                    }
                    
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
            break;
        
        case 'start':


            const server = createServer({
              // cert: readFileSync('/root/templ-tunnl/bridge/fullchain.pem'),
              // key: readFileSync('/root/templ-tunnl/bridge/privkey.pem')
            });

            const wss = new WebSocketServer({ server });

            server.listen(8080)
            
            // id => ws
            // url:id => url
            // method:id => get | post
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
                        registry['method:'+id] = jsonParsed.method
                    } 
                });
            }); 

            const routedServer = http.createServer(async (req, res) => {
                const { url, method } = req;
                var parser = new URL('http://localhost:3001'+url);
                
                console.log('req', parser.searchParams.get('id'));
                
                const headers = {
                    'Access-Control-Allow-Origin': 'https://tlon.rnft.life', /* @dev First, read about security */
                    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
                    'Access-Control-Max-Age': 2592000, // 30 days
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Headers":"X-Requested-With, Content-Type"
                  };
                  
                  if (req.method === 'OPTIONS') {
                    res.writeHead(204, headers);
                    res.end();
                    return;
                  }

                
                if (parser.hostname === 'localhost' && method === 'GET') {
                
                    res.writeHead(200, headers);
                    registry[parser.searchParams.get('id')].send(JSON.stringify({msg: registry['method:'+parser.searchParams.get('id')], url: registry['url:'+parser.searchParams.get('id')] }));
                    
                    // Message event handler
                    registry[parser.searchParams.get('id')].on('message', (message) => {
                        const jsonParsed = JSON.parse(message.toString())
                        if(jsonParsed.msg == 'timing'){
                            res.end(message);
                        }
                    });
                } 
                
                if(method == 'POST'){
                    
                    res.writeHead(200, headers);

                    var body = ''
                    req.on('data', function(data) {
                        body += data
                        console.log('Partial body: ' + body)
                    })

                    req.on('end', () => {
                        registry[parser.searchParams.get('id')].send(JSON.stringify({msg: 'post', body: body, url: registry['url:'+parser.searchParams.get('id')] }));
                        registry[parser.searchParams.get('id')].on('message', (message) => {
                            const jsonParsed = JSON.parse(message.toString())
                            res.end(message);
                        });
                    })
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
        break
    }
})()
