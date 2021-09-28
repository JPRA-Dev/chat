//get form DOM elements
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

//get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

//call socket.io
const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

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

// Function to output message to DOM (display message on page)
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}