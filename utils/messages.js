//require dependencie "moment" to have the current time from when we call the function
const moment = require('moment');

//function to make the message
function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a')     //current time in "hour:minutes am/pm" format
    }
};


//export the function
module.exports = formatMessage;
