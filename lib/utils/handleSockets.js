const getPriority = require('../../controllers/algorithmController').getPriority

let socketio = {}

exports.handleSocket = (socket, ioListen) => {
  // console.log('Message from front')
  socketio = ioListen
  console.log('users connected')

  socket.on('offer', (data) => {
    console.log("OFfered data", data)
  })
}

exports.sendPassengers = (destination) => {
  const recommend = getPriority(destination)
  // Object.values(socketio.sockets.connected).forEach( socket => {
  //   console.log(socket)
  //   socket.broadcast.emit('passengers', recommend)
  // })
  // socketio.sockets.emit('passengers', {status: true, data: recommend})
}