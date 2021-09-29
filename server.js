const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser} = require('./utils/users');

//define port
const port = process.env.PORT || 3000;    

//connect to MongoDB
const mongoose = require('mongoose');
    //link to db
const dbURI = 'mongodb+srv://JALF-admin:JALFadmin1@jalfdb.jdkac.mongodb.net/JALFdb?retryWrites=true&w=majority';
    //connection, then listen for requests
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true})
    .then( (result) => server.listen(port), console.log(`Connected to DB. Listening on port ${port}...`))
    .catch( (err) => console.log(err));

//routing and init server with socket.io
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'JALF Bot ';

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