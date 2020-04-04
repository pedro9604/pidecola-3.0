const getPriority = require('../../controllers/algorithmController').getPriority

let socketio = {}

exports.handleSocket = (socket, ioListen) => {
  console.log('Message from front', socket)
  socketio = ioListen
  console.log('users connected: ', socketio.sockets.connected)

  socket.on('offer', (data) => {
    console.log(data)
  })
}

exports.sendPassengers = (destination) => {
  const recommend = getPriority(destination)
  Object.values(socketio.sockets.connected).forEach( socket => {
    console.log(socket)
    socket.broadcast.emit('passengers', recommend)
  })
  socketio.sockets.emit('passengers', {status: true, data: recommend})
}