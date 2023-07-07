
const moment = require('moment');

function formatMessage(username, text, isEncrypted) {
    return{
        username,
        text,
        isEncrypted, //
        time: moment().format('h:mm a')
    }
}

module.exports = formatMessage;

/***********************************
NOTE:-
    isEncrypted is added in server.js
************************************/