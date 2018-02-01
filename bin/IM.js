/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('im-server:server');
var http = require('http');

var { Set, Del, HMSET, SISMEMBER } = require('../public/javascripts/redis');

//获取配置
const Types = require('./event');
/**
 * Get port from environment and store in Express.
 */
const config = require('../config/index');

var port = normalizePort(config.server.port);
app.set('port', port);


/**
 * Create HTTP server.
 */

var server = http.createServer(app);
// var io = require('socket.io')(server);
var io = app.io;
io.attach(server);


/**
 * Listen on provided port, on all network interfaces.
 */

var chat = io.of('/chat');


chat.on(Types.USER_CONNECTION, (socket) => {

  HMSET(socket.id, socket.handshake.query);

  socket.on(Types.USER_DISCONNECTING, (reason) => {
    let rooms = Object.keys(socket.rooms)
    rooms.forEach((room) => {
      socket.leave(room, () => {
        chat.to(room).emit(Types.USER_LEAVEROOM, { msg: `${socket.handshake.query.Name}离开房间`, Id: socket.id })
      })
    })
    Del(socket.id);
  })
  socket.on(Types.USER_DISCONNECT, (reason) => {

  })

  socket.on(Types.USER_JOINROOM, (e) => {

    let rooms = Object.keys(socket.rooms)
    rooms.forEach((room) => {
      socket.leave(room, () => {
        chat.to(room).emit(Types.USER_LEAVEROOM, { msg: `${socket.handshake.query.Name}离开房间`, Id: socket.id })
      })
    })
    socket.join(e.room, () => {
      chat.to(e.room).emit(Types.USER_JOINROOM, { msg: `${socket.handshake.query.Name}进入房间`, contact: socket.handshake.query, Id: socket.id })
    })
  })
  //离开房间
  socket.on(Types.USER_LEAVEROOM, (e) => {
    socket.leave(e.room, () => {
      chat.to(e.room).emit(Types.USER_LEAVEROOM, { msg: `${socket.handshake.query.Name}离开房间`, Id: socket.id })
    })
  })

  //房间内广播
  socket.on(Types.USER_SENDTOROOM, (e) => {
    SISMEMBER('forbid-' + e.room, socket.handshake.query.Id).then((num) => {
      if (num > 0) {
        socket.emit(Types.SYS_NOTICE_ERROR, '已被禁言')
      } else {
        chat.to(e.room).emit(Types.USER_SENDTOROOM, e)
      }
    })
  })
  //广播
  socket.on(Types.USER_SENDTONSP, (e) => {
    chat.emit(Types.USER_SENDTONSP, e)
  })

  //点对点
  socket.on(Types.USER_SENDTOONE, (e) => {
    chat.to(e.id).emit(Types.SENDTOONE, e)
  })
})



server.listen(port);

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
