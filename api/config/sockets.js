var socket_io = require('socket.io');
const time = require('../controllers/utilities/time');
const corsOptions = {
    cors:
        {
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        }
};

var history = [];
let myIO;

module.exports.io = (server) => {
    let io = socket_io(server, corsOptions);
    io.on('connection', function (socket){
        //console.log('A user connected');
        //console.log(socket.client.id);
        socket.emit('message_all', history);
    });
    myIO = io;
};

module.exports.adminMessageAll = (message) => {
    history.push({msg: message, time: time.momentToDate(time.moment(),undefined,'YYYY-MM-DD HH:mm:ss')});
    myIO.sockets.emit('message_all', history);

}
module.exports.adminMessagesClear = () => {
    history = [];
    myIO.sockets.emit('message_all', history);

}
module.exports.getServerMessages = () => {
    return history;
}