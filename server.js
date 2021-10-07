const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { User } = require('./models/user');


app.use(cors());
app.use(cookieParser());

/************************* FUNCTIONS APP.JS ************************************/

const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
//here we require the 'userReg.js' file so we can use it more down
const users = require('./routes/userReg');
//here we require the 'userAuth.js' file so we can use it more down
const authentication = require('./routes/userAuth');
const {auth, checkUser, checkUser2} = require('./middleware/auth');

//function to check if the config "PrivateKey" is defined
if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: PrivateKey is not defined.');
    process.exit(1);
}
//if you have the error devine the key like this in the terminal:
//in mac: ‘export chat_jwtPrivateKey=mySecureKey’
//in windows: ‘set chat_jwtPrivateKey=mySecureKey’

app.use(express.urlencoded({extended: true})); 
app.use(express.json());

//here we set up the route to the userReg.js and auth.js
app.use('/api/users', users);
app.use('/api/auth', authentication);



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


/******************* PAGES ROUTINGS **************************/


const router = express.Router();


router.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

router.get("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});


router.get('/register',function(req,res){
    res.sendFile(path.join(__dirname+'/public/register.html'));
});

router.get("/chat", auth, (req, res) => {
    res.sendFile(path.join(__dirname+'/public/chat.html'));
});

router.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname+'/public/edit.html'));
});

router.get('/me', async (req, res) => {
    const user = checkUser2;
    console.log(user.name);
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

/******************* ************** **************************/



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