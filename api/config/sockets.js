var socket_io = require('socket.io');
const time = require('../controllers/utilities/time');

var io = socket_io();
var sockets = {};

var history = [];
//var clients = [];

sockets.io = io;

io.on('connection', function (socket){
    //console.log('A user connected');
    //console.log(socket.client.id);
    socket.emit('message_all', history);
});

sockets.adminMessageAll = function (message) {
    history.push({msg: message, time: time.momentToDate(time.moment(),undefined,'YYYY-MM-DD HH:mm:ss')});
    io.sockets.emit('message_all', history);
};

sockets.adminMessagesClear = function (option) {
    history = [];
    io.sockets.emit('message_all', history);
};

sockets.getServerMessages = function () {
    return history;
};

module.exports = sockets;