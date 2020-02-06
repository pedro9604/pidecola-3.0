const validateIn = require('../lib/utils/validation').validateIn
const response = require('../lib/utils/response').response
const users = require('../models/userModel.js')
const rides = require('../models/rideModel.js')

const rideRules = {
  rider: 'required|email',
  seats: 'required|integer',
  start_location: 'required|string',
  destination: 'required|string'
}

const errorsMessage = {
  'required.rider': "El conductor es necesario.",
  'required.seats': "El número de asientos disponibles es necesario.",
  'required.start_location': "El lugar de partida es necesario.",
  'required.destination': "El lugar de destino es necesario."
}

const create = (dataRide) => {
  const { rider, passenger, seats, start_location, destination } = dataRide
  return rides.create({
    rider: users.findOne({email: rider}),
    passenger: passenger,
    available_seats: seats,
    status: 'En progreso',
    start_location: start_location,
    destination: destination,
    time: new Date(),
    ride_finished: false,
    comment: [{}]
  })
}

exports.create = (req, res) => {
  const validate = validateIn(req.body, rideRules, errorsMessage)
  const arrayPas = Array.isArray(req.body.passenger)
  /* pssngrml :: passengers' email */
  const pssngrml = req.body.passenger.map(x => x.select('email'))
  /* riderINP :: rider is not a passenger*/
  const riderINP = !pssngrml.find(u => u === req.body.rider)

  if (!(validate.pass && arrayPas && riderINP)) 
    return res.status(400).send(
      response(false, validate.errors, 'Ha ocurrido un error en el proceso.')
    )

  const rideInf = create(req.body)

  return res.status(200).send(response(true, rideInf, 'Cola creada.'))
}

const endingRideRules = {
  rider: 'required|email',
  start_location: 'required|string',
  destination: 'required|string'
}

const endRide = (data) => {
  const { rider, start_location, destination } = dataRide
  return rides.updateOne({ rider: rider, passenger: passenger, start_location: start_location, destination: destination, ride_finished: false }, {ride_finished: true, comment: comment })
}

exports.endRide = (req, res) => {
  const validate = validateIn(req.body, rideRules)

  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Error in request.'))

  const ride = rides.findOne(req.body)

  return res.status(200).send(response(true, rideInf, 'Cola finalizada.'))
}

exports.findRide = (data) => {
  return rides.findOne(data)
}