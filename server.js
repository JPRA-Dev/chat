const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();


/************************* FUNCTIONS APP.JS ************************************/

const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
//here we require the 'userReg.js' file so we can use it more down
const users = require('./routes/userReg');
//here we require the 'userAuth.js' file so we can use it more down
const auth = require('./routes/userAuth');
const authorization = require('./middleware/auth');

//function to check if the config "PrivateKey" is defined
if (!config.get('PrivateKey')) {
    console.error('FATAL ERROR: PrivateKey is not defined.');
    process.exit(1);
}
//if you have the error devine the key like this in the terminal:
//in mac: ‘export chat_PrivateKey=mySecureKey’
//in windows: ‘set chat_PrivateKey=mySecureKey’

app.use(express.urlencoded({extended: true})); 
app.use(express.json());

//here we set up the route to the userReg.js and auth.js
app.use('/api/users', users);
app.use('/api/auth', auth);

//route to a welcome message just to try. As it has the 'authorization' function there, only if we are logged in (give a valid token) it will work
app.post("/welcome", authorization, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

/**********************************************************************************/



const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
//const LoginSystem = require("./app")

//define port
const port = process.env.PORT || 3000;    

//connect to MongoDB
const mongoose = require('mongoose');
const { connect } = require('http2');
    //link to db
const dbURI = 'mongodb+srv://JALF-admin:JALFadmin1@jalfdb.jdkac.mongodb.net/JALFdb?retryWrites=true&w=majority';
    //connection, then listen for requests
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true})
    .then( (result) => server.listen(port), console.log(`Connected to DB. Listening on port ${port}...`))
    .catch( (err) => console.log(err));

//routing and init server with socket.io
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

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for chatMessage (message variable from main.js)
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //Broadcast when user disconnects
    socket.on('disconnect', () =>{
        const user = userLeave(socket.id);
        io.to(user.room).emit('message', formatMessage(botName, `${user.username} has disconnected`));
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
    })
    });
    
});