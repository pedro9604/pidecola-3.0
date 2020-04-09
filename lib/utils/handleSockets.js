const getPriority = require('../../controllers/algorithmController').getPriority

let socketio = {}
let offer = {}
exports.handleSocket = (socket, ioListen) => {
  socketio = ioListen

  socket.on('offer', data => {
    offer[socket.id] = socket
  })

  socket.on('disconnect', () => {
    if(!!offer[socket.id]) delete offer[socket.id]
  })
}

exports.sendPassengers = (destination) => {
  const recommend = getPriority(destination)
  Object.keys(offer).forEach( socketId => {
    offer[socketId].emit('passengers', {status: true, data: recommend})
  })
}

exports.sendRideOffer = (user) => {
  Object.keys(offer).forEach( socketId => {
    offer[socketId].emit('rideOffer', {status: true, data: user})
  })
}