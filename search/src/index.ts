import websocket from 'ws';

const server = new websocket.Server({ port: 8000 });

server.on('connection', sock => {
  sock.on('message', message => {
    if(typeof message === 'string'){
      
    }
  })
})
