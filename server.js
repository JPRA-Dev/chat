const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser} = require('./utils/users');
const LoginSystem = require("./app")

const botName = 'JAFL Bot';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when chat client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome user to the room
        socket.emit('message', formatMessage(botName, `Welcome to JALF, ${user.username}!`));

        // Broadcast when user connects
        socket.broadcast
        .to(user.room)
        .emit('message', formatMessage(botName, `${user.username} has connected`));
    });

    //Listen for chatMessage (message variable from main.js)
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //Broadcast when user disconnects
    socket.on('disconnect', () =>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(botName, `${user.username} has disconnected`));
    });
    
});

const port = process.env.PORT || 3000;    

server.listen(port, () => console.log(`Listening on port ${port}...`));