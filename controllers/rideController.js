const bcrypt = require('bcryptjs')
const validateIn = require('../lib/utils/validation').validateIn
const response = require('../lib/utils/response').response
const users = require('../models/userModel.js')
const rides = require('../models/rideModel.js')

const rideRules = {
  rider: 'required|user',
  passenger: 'required|array',
  start_location: 'string',
  destination: 'string',
  time: 'date',
  ride_finished: 'boolean',
  comment: 'string'
}

const create = (dataRide) => {
  const { rider, passenger, start_location, destination } = dataRide
  return rides.create({ rider: rider, passenger: passenger, start_location: start_location, destination: destination, time: new Date(), ride_finished: false, comment: '' })
}

exports.create = (req, res) => {
  const validate = validateIn(req.body, rideRules)

  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Error in request.'))

  const rideInf = { rider: req.body.rider, passenger: req.body.passenger }

  return res.status(200).send(response(true, rideInf, 'Ride created.'))
}

const endingRideRules = {
	rider: 'required|user',
	passenger: 'required|array',
	start_location: 'string',
	destination: 'string',
	ride_finished: 'boolean',
	comment: 'string'
}

const endRide = (data) => {
	const { rider, passenger, start_location, destination, comment } = dataRide
	return rides.updateOne({ rider: rider, passenger: passenger, start_location: start_location, destination: destination, ride_finished: false }, {ride_finished: true, comment: comment })
}

exports.endRide = (req, res) => {
	const validate = validateIn(req.body, rideRules)

	if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Error in request.'))

	const ride = rides.findOne(req.body)

	return res.status(200).send(response(true, rideInf, 'Ride finished'))
}
