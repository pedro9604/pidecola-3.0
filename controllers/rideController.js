/**
 * Este módulo contiene los métodos para manejar las colas en la base de datos.
 * Para conocer los datos que se almacenan por cola, ver manual de la base de
 * datos.
 * @module controllers/rideController
 * @author Francisco Márquez <12-11163@gmail.com>
 * @require módulo: controllers/userController
 * @require lib/utils/validation.validateIn
 * @require lib/utils/validation.rideRules
 * @require lib/utils/validation.rideMessage
 * @require lib/utils/utils.callbackReturn
 * @require lib/utils/response.response
 * @require models/rideModel.js
 */

const validateIn = require('../lib/utils/validation').validateIn
const rideRules = require('../lib/utils/validation').rideRules
const errorsMessage = require('../lib/utils/validation').rideMessage
const response = require('../lib/utils/response').response
const callback = require('../lib/utils/utils').callbackReturn
const users = require('../controllers/userController.js')
const rides = require('../models/rideModel.js')

/**
 * Función que agrega una cola a la base de datos.
 * @private
 * @param {Object} dataRide - Datos de la cola a modificar
 * @returns {Object} Datos de la cola insertada en la base de datos
 */
async function create(dataRide) {
  const { rider, passenger, seats, startLocation, destination } = dataRide
  const ride = {
    rider: rider.email,
    passenger: passenger,
    available_seats: seats,
    status: 'En Espera',
    start_location: startLocation,
    destination: destination,
    time: new Date(),
    ride_finished: false,
    comments: [{}]
  }
  return rides.create(ride).then(callback)
}

/**
 * Endpoint para conexión con Front-end.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
async function create(req, res) {
  const { status, errors, message, request } = await verifyDataRide(req.body)

  if (!status) return res.status(400).send(response(false, errors, message))

  const rideInf = await create(request)

  return res.status(200).send(response(true, rideInf, 'Cola creada.'))
}

/**
 * @typedef Verification
 * @type {Object}
 * @property {boolean} status  - true si y solo si la verificación pasa
 * @property {string}  errors  - Mensaje del primer error detectado
 * @property {string}  message - Verdadero destino del usuario solicitante
 */

/**
 * Función que verifica la validez de los datos de una solicitud para
 * modificar la base de datos de las colas.
 * @private
 * @param {string} status
 * @returns {Verification}
 */
async function verifyDataRide(dataRide) {
  const validate = validateIn(dataRide, rideRules, errorsMessage)
  const arrayPas = Array.isArray(dataRide.passenger)
  var emptyPas = true
  var validPass = true
  let pass
  dataRide.rider = await users.findByEmail(dataRide.rider)
  if (dataRide.passenger.length > 0) {
    pass = []
    for (var i = 0; i < dataRide.passenger.length; i++) {
      dataRide.passenger[i] = await users.findByEmail(dataRide.passenger[i])
      if (dataRide.passenger[i] === null) validPass = false
    }
    pass = dataRide.passenger.find(async u => {
      if (!!u) return u.email === dataRide.rider.email
    })
    pass = !pass
  } else {
    emptyPas = false
    pass = true
  }

  if (!(validate.pass && arrayPas && emptyPas && pass && validPass)) {
    var errors = ''
    var message = ''
    if (!validate.pass) {
      errors = validate.errors
      message = 'Los datos introducidos no cumplen con el formato requerido'
    } else if (!arrayPas) {
      errors = 'Los pasajeros no están en un arreglo'
      message = 'Los pasajeros deben estar en un arreglo'
    } else if (!emptyPas) {
      errors = 'Arreglo vacío de pasajeros'
      message = 'No puede haber una cola sin pasajeros'
    } else if (!pass) {
      errors = 'El conductor es un pasajero'
      message = 'El conductor no puede ser un pasajero'
    } else {
      errors = 'Hay pasajeros no registrados en esta cola'
      message = 'Todo pasajero tiene que ser un usuario registrado'
    }
    return { status: false, errors: errors, message: message, req: dataRide }
  }

  return { status: true, errors: '', message: '', req: dataRide }
}

/**
 * Función que modifica una cola de la base de datos. Regresa el elemento ya
 * modificado.
 * @private
 * @param {Object} data  - Datos de la cola a modificar
 * @param {Object} query - Campos a modificar con valores nuevos 
 * @returns {Object} Datos de la cola modificada en la base de datos
 */
async function updateRide(data, query) {
  const original = { returnOriginal: false }
  return rides.findOneAndUpdate(data, query, original).then(callback)
}

/**
 * Endpoint para conexión con Front-end.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
async function endRide(req, res) {
  const { status, errors, message, request } = await verifyDataRide(req.body)

  if (!status) return res.status(400).send(response(false, errors, message))

  const query = {ride_finished: true, status: 'Finalizado'}

  const rideInf = await updateRide(request, query)

  return res.status(200).send(response(true, rideInf, 'Cola finalizada.'))
}

/**
 * Función que verifica la validez del estado de una cola.
 * @private
 * @param {string} status
 * @returns {Verification}
 */
function verifyStatusRide(status) {
  const obj  = {status: status}
  const rule = {status: 'required|string'}
  const mssg = {'required.status': 'El estado de la solicitud es requerido'}
  const validate = validateIn(obj, rule, mssg)
  if (!validate.pass) {
    return {
      status: false,
      errors: validate.errors,
      message: 'El estado no tiene el formato válido'
    }
  } else if (status === 'En Espera') {
    return { status: true, errors: '', message: '' }
  } else if (status != 'En Camino') {
    return { status: true, errors: '', message: '' }
  } else if (status != 'Accidentado') {
    return { status: true, err: '', message: '' }
  } else if (status != 'Finalizado') {
    return { status: true, errors: '', message: '' }
  } else {
    return {
      status: false,
      errors: validate.errors,
      message: 'El estado no tiene el formato válido'
    }
  }
}

/**
 * Endpoint para conexión con Front-end.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
async function changeStatus(req, res) {
  const { status, errors, message } = verifyStatusRide(req.body.status)

  if (!status) return res.status(400).send(response(false, errors, message))

  const rideInf = await updateRide(req.body, {status: req.body.status})

  if (!!rideInf) {
    return res.status(200).send(response(true, rideInf, 'Estado cambiado.'))
  } else {
    const err = 'Cola no existe'
    const msg = 'La cola buscada no está registrada'
    return res.status(500).send(response(false, err, msg))
  }
}

module.exports.create       = create
module.exports.endRide      = endRide
module.exports.changeStatus = changeStatus