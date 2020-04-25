const getPriority = require('../../controllers/algorithmController').getPriority

let offer = {}
let request = {}

const connectREDIS = require('../connections').connectREDIS
const client = connectREDIS()
exports.handleSocket = (socket, ioListen) => {
  socketio = ioListen

  socket.on('offer', data => {
    offer[data.email] = socket
  })

  socket.on('request', data => {
    request[data.email] = socket
    client.keys('OFFER-' + data.email + '*', (err, list) => {
        if (err) return console.log(err)
        if (!list || !list.length) return
        list.forEach( offer => {
          client.get(offer, (err, rideOffer) => {
            if (err) return console.log(err)
            socket.emit('rideOffer', {status: true, data: JSON.parse(rideOffer)})
          })
        })
      })
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

exports.sendRideOffer = (passenger, rider) => {
  let socketToSend = Object.keys(request).find( email => email === passenger)
  if(!socketToSend) return
  request[socketToSend].emit('rideOffer', {status: true, data: rider})
}

exports.sendPassengerResponse = (user) => {
  let socketToSend = Object.keys(offer).find( email =>  email === user.rider )
  if (!socketToSend) return;
  offer[socketToSend].emit('passengerResponse', {status: true, data: user})

}

exports.sendRideStatus = (rideInf) => {
  rideInf.passenger.forEach((passenger) => {
    let socketToSend = Object.keys(request).find( email => email === passenger.email)
    if(!socketToSend) return
    request[socketToSend].emit('rideStatusChanged', {status: true, data: rideInf})
  })
}