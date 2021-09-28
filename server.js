const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when chat client connects
io.on('connection', socket => {
    socket.emit('message', 'Welcome to JALF!');

    // Broadcast when user connects
    socket.broadcast.emit('message', 'A user has connected');

    //Broadcast when user disconnects
    socket.on('disconnect', () =>{
        io.emit('message', "A user has disconnected");
    });

    //Listen for chatMessage (message variable from main.js)
    socket.on('chatMessage', (msg) => {
        io.emit('message', msg);
    });
    
});

const port = process.env.PORT || 3000;    

server.listen(port, () => console.log(`Listening on port ${port}...`));