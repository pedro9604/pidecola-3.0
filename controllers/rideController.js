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
  // const usuario = await users.findByEmail(rider)
  return rides.create({
    // rider: usuario._id,
    rider: rider._id,
    passenger: passenger,
    available_seats: seats,
    status: 'En Espera',
    start_location: startLocation,
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
  var emptyPas = true
  var validPass = true
  let pass
  req.body.rider = await users.findByEmail(req.body.rider)
  if (req.body.passenger.length > 0) {
    pass = []
    for (var i = 0; i < req.body.passenger.length; i++) {
      req.body.passenger[i] = await users.findByEmail(req.body.passenger[i])
      if (req.body.passenger[i] === null) validPass = false
    }
    pass = req.body.passenger.find(async u => {
      if (!!u) return u._id === req.body.rider._id
    })
    pass = !pass
  } else {
    emptyPas = false
    pass = true
  }

  if (!(validate.pass && arrayPas && emptyPas && pass && validPass)) {
    var errors = ""
    var message = ""
    if (!validate.pass) {
      errors = validate.errors
      message = "Los datos introducidos no cumplen con el formato requerido"
    } else if (!arrayPas) {
      errors = "Los pasajeros no están en un arreglo"
      message = "Los pasajeros deben estar en un arreglo"
    } else if (!emptyPas) {
      errors = "Arreglo vacío de pasajeros"
      message = "No puede haber una cola sin pasajeros"
    } else if (!pass) {
      errors = "El conductor es un pasajero"
      message = "El conductor no puede ser un pasajero"
    } else {
      errors = "Hay pasajeros no registrados en esta cola"
      message = "Todo pasajero tiene que ser un usuario registrado"
    }
    return res.status(400).send(response(false, errors, message))
  }

  const rideInf = await create(req.body)

  return res.status(200).send(response(true, rideInf, 'Cola creada.'))
}

async function changeStatus(dataRide, status) {
  return await updateRide(dataRide, {status: status})
}

exports.endRide = async (req, res) => {
  const validate = validateIn(req.body, rideRules)

  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Error en solicitud.'))

  const query = {ride_finished: true, status: 'Finalizado'}
  const rideInf = await updateRide(req.body, query)
  return res.status(200).send(response(true, rideInf, 'Cola finalizada.'))
}

exports.changeStatus = async (req, res) => {
  const validate = validateIn(req.body, rideRules)

  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Error en solicitud.'))

  /* Problemas con req.body, definir bien que va a tener req.body */
  const rideInf = await updateRide(req.body, {status: req.body.status})
  return res.status(200).send(response(true, rideInf, 'Cola finalizada.'))
} 

exports.findRide = async (data) => {
  return rides.findOne(data).then((sucs, err) => {
    if (!err) return sucs
    return err
  })
}

async function updateRide(data, query) {
  return rides.findOneAndUpdate(data, query, { returnOriginal: false }).then((sucs, err) => {
    if (!err) return sucs
    return err
  })
}