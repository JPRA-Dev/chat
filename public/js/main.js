//get form DOM elements
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const usersDisplay = document.getElementById('users');
const roomDisplay = document.getElementById('room-name');

//get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

//call socket.io
const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

//display room and users on html
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

//display message 
socket.on('message', message => {

    // display new message by calling function from below
    outputMessage(message);

    // scroll down to end of conversation
    chatMessages.scrollTop = chatMessages.scrollHeight;

});

//submit message
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    // Get message text from website
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatMessage', msg);
    
    // clear input field but staying in it after sending message
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

});

//retrieve all messages from storage, remove if too many
let chatHistory = new Array;
function getChatHistory() {

    //get array of former messages from storage
    if (sessionStorage.getItem('History') !== null) {
        chatHistory =JSON.parse(sessionStorage.getItem('History'));

        //loop to add each message to html
        for (i=0; i<chatHistory.length; i++) {
            chatMessages.innerHTML += chatHistory[i];
        }

        //remove messages if more than 400 in storage
        if (chatHistory.length > 10){
           
            //select messages to delete
            let messagesToRemove = chatHistory.length - 11;
            console.log("Too many messages, deleted ", messagesToRemove, "messages");
             //delete them
            for (i=0; i<messagesToRemove; i++) {
                chatHistory.shift();
            }
            //set new history in storage
            sessionStorage.setItem('History', JSON.stringify(chatHistory));
        }
    }
} 

// Function to output message to DOM (display message on page)
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    chatMessages.appendChild(div);
    
    //add message to storage if not from bot
    if (String(message.username).includes("JALF Bot") == false){
        chatHistory.push(div.innerHTML);
        sessionStorage.setItem('History', JSON.stringify(chatHistory));
    }
}

// Function to output room name
function outputRoomName(room){
    roomDisplay.innerHTML = room;
}

// Function to output connected users names
function outputUsers(users){
    usersDisplay.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}