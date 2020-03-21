/**
 * Este módulo contiene los métodos para manejar las colas en la base de datos.
 * Para conocer los datos que se almacenan por cola, ver manual de la base de
 * datos.
 * @module controllers/rideController
 * @author Francisco Márquez <12-11163@gmail.com>
 * @require módulo: controllers/userController
 * @require lib/utils/validation.validateIn
 * @require lib/utils/response.response
 * @require models/rideModel.js
 */

const validateIn = require('../lib/utils/validation').validateIn
const response = require('../lib/utils/response').response
const users = require('../controllers/userController.js')
const rides = require('../models/rideModel.js')

/**
 * Reglas que tienen que cumplir las solicitudes enviadas desde Front-End para
 * generar una cola en la base de datos.
 * @name rideRules
 * @type {Object}
 * @property {string} rider - Campo rider de la solicitud es obligatorio y debe
 * tener formato de e-mail
 * @property {string} seats - Campo seats de la solicitud es obligatorio y debe
 * tener formato de entero
 * @property {string} startLocation - Campo startLocation de la solicitud es
 * obligatorio
 * @property {string} destination - Campo destination de la solicitud es
 * obligatorio
 * @constant
 * @private
 */
const rideRules = {
  rider: 'required|email',
  seats: 'required|integer',
  startLocation: 'required|string',
  destination: 'required|string'
}

/**
 * Mensajes de error en caso de no se cumplan las rideRules en una solicitud.
 * @name errorsMessage
 * @type {Object}
 * @property {string} 'required.rider' - Caso: Omisión o error del rider
 * @property {string} 'required.seats' - Caso: Omisión o error del seats
 * @property {string} 'required.startLocation' - Caso: Omisión del startLocation
 * @property {string} 'required.destination' - Caso: Omisión del destination
 * @constant
 * @private
 */
const errorsMessage = {
  'required.rider': 'El conductor es necesario.',
  'required.seats': 'El número de asientos disponibles es necesario.',
  'required.startLocation': 'El lugar de partida es necesario.',
  'required.destination': 'El lugar de destino es necesario.'
}

/**
 * Función que agrega una cola a la base de datos.
 * @function
 * @private
 * @param {Object} dataRide
 * @returns {Object} Datos de la cola insertada en la base de datos
 */
const create = async (dataRide) => {
  const { rider, passenger, seats, startLocation, destination } = dataRide
  const usuario = await users.findByEmail(rider)
  console.log(usuario)
  return rides.create({
    rider: usuario,
    passenger: passenger,
    available_seats: seats,
    status: 'En Espera',
    startLocation: startLocation,
    destination: destination,
    time: new Date(),
    ride_finished: false,
    comment: [{}]
  }).then((sucs, err) => {
    if (!err) return sucs
    return err
  })
}

/**
 * Endpoint para conexión con Front-end.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @function
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
exports.create = async (req, res) => {
  const validate = validateIn(req.body, rideRules, errorsMessage)
  const arrayPas = Array.isArray(req.body.passenger)
  let pass
  if (req.body.passenger.length > 0) {
    const riderId = await users.findByEmail(req.body.rider).id
    pass = !req.body.passenger.find(async u => {
      const passegerId = await users.findByEmail(u).id
      return passegerId === riderId
    })
  } else {
    pass = true
  }

  if (!(validate.pass && arrayPas && pass)) {
    return res.status(400).send(
      response(false, validate.errors, 'Ha ocurrido un error en el proceso.')
    )
  }

  const rideInf = await create(req.body)

  return res.status(200).send(response(true, rideInf, 'Cola creada.'))
}

/* const endingRideRules = {
  rider: 'required|email',
  startLocation: 'required|string',
  destination: 'required|string'
}

const endRide = (data) => {
  const { rider, startLocation, destination } = dataRide
  return rides.updateOne({ rider: rider, passenger: passenger, startLocation: startLocation, destination: destination, ride_finished: false }, { ride_finished: true, comment: comment })
} */

async function changeStatus(dataRide, status) {
  return await updateStatus(dataRide, {status: status})
}

exports.endRide = (req, res) => {
  const validate = validateIn(req.body, rideRules)

  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Error in request.'))

  // const ride = rides.findOne(req.body)
  let rideInf
  return res.status(200).send(response(true, rideInf, 'Cola finalizada.'))
}

exports.findRide = async (data) => {
  return rides.findOne(data).then((sucs, err) => {
    if (!err) return sucs
    return err
  })
}

exports.updateRide = (data, query) => {
  return rides.findOneAndUpdate(data, query, { returnOriginal: false })
}